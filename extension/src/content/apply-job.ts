import {
	AppliedJobPayloadSchema,
	ApplyPhase,
	assertExtensionSupportedPublishPolicy,
	validateJob,
} from "@auto-upload/domain";
import type { AppliedJobPayload } from "@auto-upload/domain";
import { decodeBase64ChunksToUint8 } from "./binary.js";
import { BILIBILI_VIDEO_FILE_INPUT_SELECTORS, SEMI_AUTO_BANNER_ID } from "./bilibili-selectors.js";
import { applyFieldsPhase } from "./apply-fields-phase.js";
import { assignFileToInput, pickFirstElement } from "./dom.js";

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
	if (payload.attachments.video.kind !== "manualLargeFile") return;

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
	title.textContent = "semi-auto upload: attach large video manually";
	title.style.fontWeight = "700";
	title.style.marginBottom = "8px";

	const hint = document.createElement("div");
	const sizeText = formatBytes(payload.attachments.video.sizeBytes);
	hint.textContent = `Chrome limits silent file picking for large files (${sizeText}). Use the picker, or copy your path via the button below.`;

	const path = document.createElement("pre");
	path.textContent = payload.attachments.video.absolutePath;
	path.style.whiteSpace = "pre-wrap";
	path.style.marginTop = "10px";

	const copy = document.createElement("button");
	copy.textContent = "Copy absolute video path";
	copy.style.marginTop = "10px";
	copy.style.padding = "8px 10px";

	copy.addEventListener("click", () => {
		void navigator.clipboard.writeText(payload.attachments.video.absolutePath);
	});

	banner.append(title, hint, path, copy);
	document.documentElement.append(banner);
}

async function applyVideoAttachment(payload: AppliedJobPayload): Promise<void> {
	const video = payload.attachments.video;
	if (video.kind === "skipped") return;

	const input = pickFirstElement<HTMLInputElement>(document, BILIBILI_VIDEO_FILE_INPUT_SELECTORS);
	if (!input) throw new Error("video_file_input_not_found");

	if (video.kind === "manualLargeFile") {
		renderManualVideoBanner(payload);
		return;
	}

	const bytes = decodeBase64ChunksToUint8(video.chunks);
	const fileName = video.suggestedFileName ?? FALLBACK_VIDEO_FILE_NAME;
	const file = new File([bytes], fileName, { type: video.mimeType });
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

	const phase = validatedPayload.data.applyPhase;

	if (phase === ApplyPhase.VideoOnly || phase === ApplyPhase.Full) {
		await applyVideoAttachment(validatedPayload.data);
		if (phase === ApplyPhase.VideoOnly) {
			const video = validatedPayload.data.attachments.video;
			if (video.kind === "manualLargeFile") {
				renderManualVideoBanner(validatedPayload.data);
			}
		}
	}

	if (phase === ApplyPhase.FieldsOnly || phase === ApplyPhase.Full) {
		await applyFieldsPhase(jobParse.job, validatedPayload.data);
	}
}
