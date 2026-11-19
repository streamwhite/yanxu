import {
	AppliedJobPayloadSchema,
	ApplyPhase,
	assertExtensionSupportedPublishPolicy,
	Platform,
	getJobPlatform,
	validateJob,
} from "@yanxu/domain";
import type { AppliedJobPayload } from "@yanxu/domain";
import { assertBatchPayloadMatchesJob } from "./assert-batch-payload-matches-job.js";
import { clickVideoUploadTriggerForPlatform } from "../platforms/click-video-upload-trigger-for-platform.js";
import { platformFullPhaseVideoToFieldsSettleMs } from "../platforms/platform-full-phase-video-to-fields-settle-ms.js";
import { platformVideoUploadSettleMs } from "../platforms/platform-video-upload-settle-ms.js";
import { applyChannelsVideoFile } from "../platforms/channels/apply-channels-video-file.js";
import { channelsVideoAlreadyUploaded } from "../platforms/channels/channels-video-already-uploaded.js";
import { waitForChannelsPageInteractive } from "../platforms/channels/wait-for-channels-page-interactive.js";
import { waitForChannelsPostUploadFormReady } from "../platforms/channels/wait-for-channels-post-upload-form-ready.js";
import { resolveVideoFileInputForPlatform } from "./resolve-video-file-input-for-platform.js";
import { decodeBase64ChunksToUint8 } from "./binary.js";
import { SEMI_AUTO_BANNER_ID } from "./bilibili-selectors.js";
import { applyFieldsPhase } from "./apply-fields-phase.js";
import { reportApplyProgress } from "./report-apply-progress.js";
import { BatchProgressKind } from "../shared/batch-progress.js";
import { assignFileToInput } from "./dom.js";
import { waitMs } from "./wait-ms.js";

const FALLBACK_VIDEO_FILE_NAME = "upload-video.mp4" as const;

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${String(bytes)} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function removeExistingBanner(): void {
	document.getElementById(SEMI_AUTO_BANNER_ID)?.remove();
}

function renderManualVideoBanner(payload: AppliedJobPayload): void {
	removeExistingBanner();
	const video = payload.attachments.video;
	if (video.kind !== "manualLargeFile") return;

	const banner = document.createElement("div");
	banner.id = SEMI_AUTO_BANNER_ID;
	banner.style.position = "fixed";
	banner.style.zIndex = "2147483647";
	banner.style.right = "16px";
	banner.style.bottom = "16px";
	banner.style.maxWidth = "420px";
	banner.style.padding = "12px";
	banner.style.borderRadius = "8px";
	banner.style.background = "rgba(20, 20, 20, 0.92)";
	banner.style.color = "#fff";
	banner.style.font = "14px/1.4 system-ui, sans-serif";
	banner.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";

	const title = document.createElement("div");
	title.textContent = "请手动选择视频";
	title.style.fontWeight = "700";
	title.style.marginBottom = "8px";

	const hint = document.createElement("div");
	const sizeText = formatBytes(video.sizeBytes);
	hint.textContent = `文件 ${sizeText}，浏览器无法自动选择。请用上传框，或复制下方路径。`;

	const path = document.createElement("pre");
	path.textContent = video.absolutePath;
	path.style.whiteSpace = "pre-wrap";
	path.style.marginTop = "10px";

	const copy = document.createElement("button");
	copy.textContent = "复制视频路径";
	copy.style.marginTop = "10px";
	copy.style.padding = "8px 10px";

	copy.addEventListener("click", () => {
		void navigator.clipboard.writeText(video.absolutePath);
	});

	banner.append(title, hint, path, copy);
	document.documentElement.append(banner);
}

async function applyVideoAttachment(
	payload: AppliedJobPayload,
	platform: ReturnType<typeof getJobPlatform>,
): Promise<void> {
	const video = payload.attachments.video;
	if (video.kind === "skipped") return;

	if (video.kind === "manualLargeFile") {
		renderManualVideoBanner(payload);
		return;
	}

	const bytes = decodeBase64ChunksToUint8(video.chunks);
	const fileName = video.suggestedFileName ?? FALLBACK_VIDEO_FILE_NAME;
	const file = new File([bytes as BlobPart], fileName, { type: video.mimeType });

	if (platform === Platform.Channels) {
		if (channelsVideoAlreadyUploaded(document)) {
			await waitForChannelsPostUploadFormReady(document);
			return;
		}

		const readyForCover = await applyChannelsVideoFile(file);

		if (!readyForCover) {
			throw new Error(
				`video_file_input_not_found:${platform}:item_${String(payload.batch.itemIndex)}`,
			);
		}
		await waitForChannelsPostUploadFormReady(document);
		return;
	}

	let input = await resolveVideoFileInputForPlatform(platform, null);

	if (!input) {
		const trigger = clickVideoUploadTriggerForPlatform(document, platform);
		await waitMs(platformVideoUploadSettleMs(platform));
		input = await resolveVideoFileInputForPlatform(platform, trigger.uploadArea);
	}

	if (!input) {
		throw new Error(
			`video_file_input_not_found:${platform}:item_${String(payload.batch.itemIndex)}`,
		);
	}

	assignFileToInput(input, file);
}

export async function applyJobPayload(payload: AppliedJobPayload): Promise<void> {
	const validatedPayload = AppliedJobPayloadSchema.safeParse(payload);
	if (!validatedPayload.success) {
		throw new Error(`invalid_payload: ${validatedPayload.error.message}`);
	}

	const jobParse = validateJob(JSON.parse(validatedPayload.data.jobJson));
	if (!jobParse.ok) throw new Error(`invalid_job: ${jobParse.errorMessage}`);
	assertExtensionSupportedPublishPolicy(jobParse.job);
	assertBatchPayloadMatchesJob(validatedPayload.data, jobParse.job);

	const phase = validatedPayload.data.applyPhase;
	const platform = getJobPlatform(jobParse.job);

	if (platform === Platform.Channels) {
		await waitForChannelsPageInteractive(document);
	}

	if (phase === ApplyPhase.VideoOnly || phase === ApplyPhase.Full) {
		await applyVideoAttachment(validatedPayload.data, platform);
		const video = validatedPayload.data.attachments.video;
		if (video.kind !== "skipped") {
			reportApplyProgress({
				platform,
				itemIndex: validatedPayload.data.batch.itemIndex,
				kind: BatchProgressKind.Video,
				label: video.kind === "manualLargeFile" ? "video: attach manually" : "video file assigned",
			});
		}
		if (phase === ApplyPhase.VideoOnly) {
			if (video.kind === "manualLargeFile") {
				renderManualVideoBanner(validatedPayload.data);
			}
		}
		if (phase === ApplyPhase.Full && video.kind !== "skipped" && video.kind !== "manualLargeFile") {
			const settleMs = platformFullPhaseVideoToFieldsSettleMs(platform);
			if (settleMs > 0) await waitMs(settleMs);
		}
	}

	if (phase === ApplyPhase.FieldsOnly || phase === ApplyPhase.Full) {
		await applyFieldsPhase(jobParse.job, validatedPayload.data);
	}
}
