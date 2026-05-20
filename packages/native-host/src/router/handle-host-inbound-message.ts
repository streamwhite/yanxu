import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";
import {
	type HostInboundMessage,
	type HostOutboundBatch,
	type HostOutboundMessage,
	ApplyPhase,
	assertExtensionSupportedPublishPolicy,
	DEFAULT_JOB_POLICY,
	DEFAULT_TRANSFER_CHUNK_BYTES,
	normalizeCanonicalJobTexts,
	validateJob,
} from "@auto-upload/domain";
import { resolveCoverAttachment } from "../attachments/resolve-cover-attachment.js";
import { resolveVideoAttachment } from "../attachments/resolve-video-attachment.js";
import { buildOutboundApplyBatch } from "./build-outbound-apply-batch.js";

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
		return await applyJobFromFile(inbound.jobFilePath, inbound.applyPhase);
	} catch (error) {
		return [toErrorOutbound(error)];
	}
}

async function applyJobFromFile(
	jobFilePath: string,
	applyPhase: ApplyPhase,
): Promise<HostOutboundBatch> {
	if (!isAbsolutePosixOrWin(jobFilePath)) {
		throw new Error("job_file_path_must_be_absolute");
	}

	const resolvedJobFilePath = resolveCrossPlatform(jobFilePath);
	await fsp.access(resolvedJobFilePath, fsConstants.R_OK);
	const rawText = await fsp.readFile(resolvedJobFilePath, "utf8");
	const rawJson = JSON.parse(rawText) as unknown;

	const validated = validateJob(rawJson);
	if (!validated.ok) {
		return [
			{
				type: "error",
				code: "invalid_job",
				message: validated.errorMessage,
			},
		];
	}

	const job = normalizeCanonicalJobTexts(validated.job);
	assertExtensionSupportedPublishPolicy(job);

	const resolvedVideoPath = resolveIfPresent(job.assets.localVideoPath);
	if (!resolvedVideoPath) throw new Error("video_path_missing");
	await fsp.access(resolvedVideoPath, fsConstants.R_OK);

	const resolvedCoverPath = resolveIfPresent(job.assets.localCoverPath);
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
