import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";
import {
	type HostInboundMessage,
	type HostOutboundBatch,
	type HostOutboundMessage,
	type PlatformId,
	ApplyPhase,
	assertExtensionSupportedPublishPolicy,
	DEFAULT_JOB_POLICY,
	DEFAULT_TRANSFER_CHUNK_BYTES,
} from "@auto-upload/domain";
import { resolveExistingCoverPath } from "../assets/resolve-existing-cover-path.js";
import { resolveCoverAttachment } from "../attachments/resolve-cover-attachment.js";
import { resolveVideoAttachment } from "../attachments/resolve-video-attachment.js";
import { buildOutboundApplyBatch } from "./build-outbound-apply-batch.js";
import { readJobFileJson } from "./read-job-file-json.js";
import {
	inspectJobFileOutlineFromJson,
	resolveCanonicalJobFromFileJson,
} from "./resolve-canonical-job-from-file.js";
import { validateBatchJobAssetsFromFileJson } from "./validate-batch-job-assets-from-file.js";

const REASON_VIDEO_SKIPPED_FIELDS_PHASE = "fields_only_phase" as const;
const REASON_COVER_SKIPPED_VIDEO_PHASE = "video_only_phase" as const;

function resolveIfPresent(absolutePath?: string): string | undefined {
	if (!absolutePath) return undefined;
	if (!isAbsolutePosixOrWin(absolutePath)) throw new Error("paths_must_be_absolute");
	return resolveCrossPlatform(absolutePath);
}

function toErrorOutbound(err: unknown): HostOutboundMessage {
	if (!(err instanceof Error)) {
		return {
			type: "error",
			code: "unknown_error",
			message: "Unexpected non-error rejection",
		};
	}

	return { type: "error", code: "host_error", message: err.message };
}

export async function handleHostInboundMessage(
	inbound: HostInboundMessage,
): Promise<HostOutboundBatch> {
	try {
		if (inbound.type === "ping") return [{ type: "pong" }];
		if (inbound.type === "inspectJobFromFile") {
			return await inspectJobFromFile(inbound.jobFilePath);
		}
		if (inbound.type === "checkBatchJobAssetsFromFile") {
			return await checkBatchJobAssetsFromFile(inbound.jobFilePath);
		}
		return await applyJobFromFile(
			inbound.jobFilePath,
			inbound.applyPhase,
			inbound.itemIndex,
			inbound.platform,
		);
	} catch (error) {
		return [toErrorOutbound(error)];
	}
}

async function checkBatchJobAssetsFromFile(jobFilePath: string): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(jobFilePath);
	const checked = await validateBatchJobAssetsFromFileJson(rawJson);
	if (!checked.ok) {
		return [{ type: "error", code: checked.code, message: checked.message }];
	}
	return [{ type: "batchAssetsReady" }];
}

async function inspectJobFromFile(jobFilePath: string): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(jobFilePath);
	const inspected = inspectJobFileOutlineFromJson(rawJson);
	if (!inspected.ok) {
		return [{ type: "error", code: inspected.code, message: inspected.message }];
	}
	return [{ type: "jobFileOutline", outline: inspected.outline }];
}

async function applyJobFromFile(
	jobFilePath: string,
	applyPhase: ApplyPhase,
	itemIndex: number,
	platform: PlatformId,
): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(jobFilePath);
	const resolved = resolveCanonicalJobFromFileJson(rawJson, itemIndex, platform);
	if (!resolved.ok) {
		return [{ type: "error", code: resolved.code, message: resolved.message }];
	}

	const job = resolved.job;
	assertExtensionSupportedPublishPolicy(job);

	const resolvedVideoPath = resolveIfPresent(job.assets.localVideoPath);
	if (!resolvedVideoPath) throw new Error("video_path_missing");
	await fsp.access(resolvedVideoPath, fsConstants.R_OK);

	const coverPathHint = resolveIfPresent(job.assets.localCoverPath);
	const resolvedCoverPath = coverPathHint
		? await resolveExistingCoverPath(coverPathHint)
		: undefined;
	const maxDirectAttachBytes =
		job.policy?.maxDirectAttachBytes ?? DEFAULT_JOB_POLICY.maxDirectAttachBytes;
	const maxCoverInlineBytes =
		job.policy?.maxCoverInlineBytes ?? DEFAULT_JOB_POLICY.maxCoverInlineBytes;
	const transferChunkBytes = job.policy?.transferChunkBytes ?? DEFAULT_TRANSFER_CHUNK_BYTES;
	const jobJson = JSON.stringify(job);

	if (applyPhase === ApplyPhase.FieldsOnly) {
		const resolvedCover = await resolveCoverAttachment({
			absolutePath: resolvedCoverPath,
			maxCoverInlineBytes,
			transferChunkBytes,
		});

		return buildOutboundApplyBatch({
			applyPhase,
			jobJson,
			batchItemIndex: itemIndex,
			targetPlatform: platform,
			video: { kind: "skipped", reasonCode: REASON_VIDEO_SKIPPED_FIELDS_PHASE },
			cover:
				resolvedCover.mode === "payload"
					? resolvedCover.payload
					: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
			coverStreamBatch: resolvedCover.mode === "stream" ? resolvedCover.streamBatch : undefined,
		});
	}

	const resolvedCover =
		applyPhase === ApplyPhase.VideoOnly
			? {
					mode: "payload" as const,
					payload: { kind: "skipped" as const, reasonCode: REASON_COVER_SKIPPED_VIDEO_PHASE },
				}
			: await resolveCoverAttachment({
					absolutePath: resolvedCoverPath,
					maxCoverInlineBytes,
					transferChunkBytes,
				});

	const resolvedVideo = await resolveVideoAttachment({
		absolutePath: resolvedVideoPath,
		maxDirectAttachBytes,
		transferChunkBytes,
	});

	return buildOutboundApplyBatch({
		applyPhase,
		jobJson,
		batchItemIndex: itemIndex,
		targetPlatform: platform,
		video:
			resolvedVideo.mode === "payload"
				? resolvedVideo.payload
				: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
		cover:
			resolvedCover.mode === "payload"
				? resolvedCover.payload
				: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
		videoStreamBatch: resolvedVideo.mode === "stream" ? resolvedVideo.streamBatch : undefined,
		coverStreamBatch: resolvedCover.mode === "stream" ? resolvedCover.streamBatch : undefined,
	});
}
