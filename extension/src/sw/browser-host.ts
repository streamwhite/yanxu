import {
	ApplyPhase,
	BatchAssetKind,
	DEFAULT_JOB_POLICY,
	DEFAULT_TRANSFER_CHUNK_BYTES,
	MAX_NATIVE_INLINE_COVER_BYTES,
	MAX_NATIVE_INLINE_VIDEO_BYTES,
	assertExtensionSupportedPublishPolicy,
	buildJobFileOutline,
	formatMissingBatchAssetsMessage,
	listBatchCoverPathCandidates,
	listHorizontalCoverPathCandidates,
	listRequiredBatchAssets,
	normalizeBatchJobTexts,
	normalizeCanonicalJobTexts,
	projectBatchItemToCanonicalJob,
	validateJobFile,
	type AttachmentCoverPayload,
	type AttachmentVideoPayload,
	type CanonicalJob,
	type HostInboundMessage,
	type HostOutboundBatch,
	type HostOutboundMessage,
	type MissingBatchAsset,
	type PlatformId,
} from "@yanxu/domain";
import { BROWSER_JOB_FILE_PATH, type BrowserFileSource } from "../shared/browser-file-source.js";
import { TAB_MESSAGE_SAFE_BYTES } from "../shared/constants/tab-message-limits.js";
import { estimateJsonUtf8ByteLength } from "../shared/estimate-json-utf8-byte-length.js";

const REASON_VIDEO_SKIPPED_FIELDS_PHASE = "fields_only_phase" as const;
const REASON_COVER_SKIPPED_VIDEO_PHASE = "video_only_phase" as const;
const REASON_STREAM_ASSEMBLED_IN_EXTENSION = "stream_assembled_in_extension" as const;
const REASON_OVER_LIMIT = "over_max_direct_attach_bytes" as const;
const REASON_COVER_TOO_LARGE = "cover_over_inline_limit" as const;
const REASON_NO_COVER = "no_cover_path" as const;

const VIDEO_EXT_TO_MIME: Readonly<Record<string, string>> = {
	".mp4": "video/mp4",
	".mov": "video/quicktime",
	".mkv": "video/x-matroska",
	".webm": "video/webm",
	".avi": "video/x-msvideo",
} as const;

const IMAGE_EXT_TO_MIME: Readonly<Record<string, string>> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
} as const;

const FALLBACK_MIME = "application/octet-stream" as const;

const MIN_STREAM_CHUNK_BYTES = 64 * 1024;
const BASE64_OVERHEAD_FACTOR = 1.4;

function resolveStreamChunkBytes(transferChunkBytes: number): number {
	const rawBudget = Math.floor(TAB_MESSAGE_SAFE_BYTES / BASE64_OVERHEAD_FACTOR);
	return Math.min(transferChunkBytes, Math.max(rawBudget, MIN_STREAM_CHUNK_BYTES));
}

const COVER_STREAM_MESSAGE_KINDS = {
	cover: { start: "coverStreamStart", chunk: "coverStreamChunk" },
	coverHorizontal: {
		start: "horizontalCoverStreamStart",
		chunk: "horizontalCoverStreamChunk",
	},
} as const;

type CoverStreamKind = keyof typeof COVER_STREAM_MESSAGE_KINDS;

export function basenameOfPath(filePath: string): string {
	const normalized = filePath.replaceAll("\\", "/");
	return normalized.slice(normalized.lastIndexOf("/") + 1);
}

function mimeFromPath(filePath: string, table: Readonly<Record<string, string>>): string {
	const lower = filePath.toLowerCase();
	for (const [extension, mime] of Object.entries(table)) {
		if (lower.endsWith(extension)) return mime;
	}
	return FALLBACK_MIME;
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	const step = 0x8000;
	for (let index = 0; index < bytes.length; index += step) {
		binary += String.fromCharCode(...bytes.subarray(index, index + step));
	}
	return btoa(binary);
}

function chunkBytesToBase64(bytes: Uint8Array, chunkBytes: number): string[] {
	if (chunkBytes <= 0) throw new Error("chunk_bytes_must_be_positive");
	const chunks: string[] = [];
	for (let offset = 0; offset < bytes.length; offset += chunkBytes) {
		chunks.push(bytesToBase64(bytes.subarray(offset, offset + chunkBytes)));
	}
	return chunks;
}

async function tryFileHandle(
	directory: FileSystemDirectoryHandle,
	fileName: string,
): Promise<FileSystemFileHandle | null> {
	try {
		return await directory.getFileHandle(fileName);
	} catch {
		return null;
	}
}

async function findFirstFileHandle(
	directory: FileSystemDirectoryHandle,
	fileNames: string[],
): Promise<FileSystemFileHandle | null> {
	for (const fileName of fileNames) {
		const handle = await tryFileHandle(directory, fileName);
		if (handle) return handle;
	}
	return null;
}

async function readJobFileJson(source: BrowserFileSource): Promise<unknown> {
	const file = await source.jobFile.getFile();
	const text = await file.text();
	return JSON.parse(text) as unknown;
}

function resolveCanonicalJob(
	rawJson: unknown,
	itemIndex?: number,
	platform?: PlatformId,
): { ok: true; job: CanonicalJob } | { ok: false; code: string; message: string } {
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return { ok: false, code: "invalid_job", message: validated.errorMessage };
	}

	if (validated.kind === "canonical") {
		return { ok: true, job: normalizeCanonicalJobTexts(validated.job) };
	}

	const batch = normalizeBatchJobTexts(validated.job);
	if (itemIndex === undefined || platform === undefined) {
		return {
			ok: false,
			code: "batch_job_requires_item",
			message: "batch job requires itemIndex and platform",
		};
	}

	try {
		return {
			ok: true,
			job: normalizeCanonicalJobTexts(projectBatchItemToCanonicalJob(batch, itemIndex, platform)),
		};
	} catch (error: unknown) {
		return {
			ok: false,
			code: "batch_projection_failed",
			message: error instanceof Error ? error.message : "batch_projection_failed",
		};
	}
}

async function inspectJobFromFile(source: BrowserFileSource): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(source);
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return [{ type: "error", code: "invalid_job", message: validated.errorMessage }];
	}
	return [{ type: "jobFileOutline", outline: buildJobFileOutline(validated.job) }];
}

async function resolveRequiredAssetHandle(
	source: BrowserFileSource,
	asset: MissingBatchAsset,
): Promise<FileSystemFileHandle | null> {
	if (asset.kind === BatchAssetKind.Cover) {
		return findFirstFileHandle(
			source.assetsDir,
			listBatchCoverPathCandidates(asset.absolutePath).map(basenameOfPath),
		);
	}
	if (asset.kind === BatchAssetKind.HorizontalCover) {
		return findFirstFileHandle(
			source.assetsDir,
			listHorizontalCoverPathCandidates(asset.absolutePath).map(basenameOfPath),
		);
	}
	return tryFileHandle(source.assetsDir, basenameOfPath(asset.absolutePath));
}

async function checkBatchJobAssets(
	source: BrowserFileSource,
	includeHorizontalCover?: boolean,
): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(source);
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return [{ type: "error", code: "invalid_job", message: validated.errorMessage }];
	}
	if (validated.kind !== "batch") {
		return [
			{
				type: "error",
				code: "batch_job_required",
				message: `batch job required (jobVersion ${String(validated.job.jobVersion)})`,
			},
		];
	}

	const batch = normalizeBatchJobTexts(validated.job);
	const required = listRequiredBatchAssets(batch, { includeHorizontalCover });
	const missing: MissingBatchAsset[] = [];
	for (const asset of required) {
		const handle = await resolveRequiredAssetHandle(source, asset);
		if (!handle) missing.push(asset);
	}

	if (missing.length > 0) {
		return [
			{
				type: "error",
				code: "batch_assets_missing",
				message: formatMissingBatchAssetsMessage(missing),
			},
		];
	}
	return [{ type: "batchAssetsReady" }];
}

async function getCoverFileHandle(
	source: BrowserFileSource,
	coverPathHint: string | undefined,
	horizontal: boolean,
): Promise<FileSystemFileHandle | null> {
	if (!coverPathHint) return null;
	const candidates = horizontal
		? listHorizontalCoverPathCandidates(coverPathHint)
		: listBatchCoverPathCandidates(coverPathHint);
	return findFirstFileHandle(source.assetsDir, candidates.map(basenameOfPath));
}

type ResolvedVideo = {
	payload: AttachmentVideoPayload;
	streamBatch?: HostOutboundBatch;
};

async function resolveVideo(
	fileHandle: FileSystemFileHandle,
	maxDirectAttachBytes: number,
	transferChunkBytes: number,
): Promise<ResolvedVideo> {
	const file = await fileHandle.getFile();
	if (file.size > maxDirectAttachBytes) {
		return {
			payload: {
				kind: "manualLargeFile",
				absolutePath: file.name,
				sizeBytes: file.size,
				reasonCode: REASON_OVER_LIMIT,
				suggestedFileName: file.name,
			},
		};
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const mimeType = mimeFromPath(file.name, VIDEO_EXT_TO_MIME);
	if (file.size <= MAX_NATIVE_INLINE_VIDEO_BYTES) {
		return {
			payload: {
				kind: "inlineBase64Chunks",
				mimeType,
				chunks: chunkBytesToBase64(bytes, transferChunkBytes),
				suggestedFileName: file.name,
			},
		};
	}

	const chunks = chunkBytesToBase64(bytes, resolveStreamChunkBytes(transferChunkBytes));
	const streamBatch: HostOutboundBatch = [
		{
			type: "videoStreamStart",
			mimeType,
			suggestedFileName: file.name,
			totalBytes: file.size,
			chunkCount: chunks.length,
		},
	];
	for (let index = 0; index < chunks.length; index++) {
		const base64 = chunks[index];
		if (base64) streamBatch.push({ type: "videoStreamChunk", index, base64 });
	}
	return {
		payload: { kind: "skipped", reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION },
		streamBatch,
	};
}

type ResolvedCover = {
	payload: AttachmentCoverPayload;
	streamBatch?: HostOutboundBatch;
};

async function resolveCover(
	fileHandle: FileSystemFileHandle | null,
	maxCoverInlineBytes: number,
	transferChunkBytes: number,
	streamKind: CoverStreamKind = "cover",
): Promise<ResolvedCover> {
	if (!fileHandle) return { payload: { kind: "skipped", reasonCode: REASON_NO_COVER } };

	const file = await fileHandle.getFile();
	if (file.size > maxCoverInlineBytes) {
		return { payload: { kind: "skipped", reasonCode: REASON_COVER_TOO_LARGE } };
	}

	const bytes = new Uint8Array(await file.arrayBuffer());
	const mimeType = mimeFromPath(file.name, IMAGE_EXT_TO_MIME);
	if (file.size <= MAX_NATIVE_INLINE_COVER_BYTES) {
		return { payload: { kind: "inlineBase64", mimeType, base64: bytesToBase64(bytes) } };
	}

	const chunks = chunkBytesToBase64(bytes, resolveStreamChunkBytes(transferChunkBytes));
	const messageKinds = COVER_STREAM_MESSAGE_KINDS[streamKind];
	const streamBatch: HostOutboundBatch = [
		{
			type: messageKinds.start,
			mimeType,
			suggestedFileName: file.name,
			totalBytes: file.size,
			chunkCount: chunks.length,
		},
	];
	for (let index = 0; index < chunks.length; index++) {
		const base64 = chunks[index];
		if (base64) streamBatch.push({ type: messageKinds.chunk, index, base64 });
	}
	return {
		payload: { kind: "skipped", reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION },
		streamBatch,
	};
}

function buildApplyBatch(input: {
	applyPhase: ApplyPhase;
	jobJson: string;
	batchItemIndex: number;
	targetPlatform: PlatformId;
	video: AttachmentVideoPayload;
	cover: AttachmentCoverPayload;
	coverHorizontal?: AttachmentCoverPayload;
	videoStreamBatch?: HostOutboundBatch;
	coverStreamBatch?: HostOutboundBatch;
	coverHorizontalStreamBatch?: HostOutboundBatch;
}): HostOutboundBatch {
	const ready: HostOutboundMessage = {
		type: "applyJobReady",
		payload: {
			applyPhase: input.applyPhase,
			jobJson: input.jobJson,
			batch: {
				itemIndex: input.batchItemIndex,
				targetPlatform: input.targetPlatform,
			},
			attachments: {
				video: input.videoStreamBatch?.length
					? { kind: "skipped", reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION }
					: input.video,
				cover: input.coverStreamBatch?.length
					? { kind: "skipped", reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION }
					: input.cover,
				...(input.coverHorizontal === undefined
					? {}
					: {
							coverHorizontal: input.coverHorizontalStreamBatch?.length
								? {
										kind: "skipped" as const,
										reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION,
									}
								: input.coverHorizontal,
						}),
			},
		},
	};

	const byteLength = estimateJsonUtf8ByteLength(ready);
	if (byteLength > TAB_MESSAGE_SAFE_BYTES) {
		return [
			{
				type: "error",
				code: "browser_message_response_too_large",
				message: `response is ${String(byteLength)} bytes (max ${String(TAB_MESSAGE_SAFE_BYTES)})`,
			},
		];
	}

	const outbound: HostOutboundBatch = [];
	if (input.videoStreamBatch?.length) outbound.push(...input.videoStreamBatch);
	if (input.coverStreamBatch?.length) outbound.push(...input.coverStreamBatch);
	if (input.coverHorizontalStreamBatch?.length) {
		outbound.push(...input.coverHorizontalStreamBatch);
	}
	outbound.push(ready);
	return outbound;
}

async function applyJobFromFile(
	source: BrowserFileSource,
	applyPhase: ApplyPhase,
	itemIndex: number,
	platform: PlatformId,
	includeHorizontalCover?: boolean,
): Promise<HostOutboundBatch> {
	const rawJson = await readJobFileJson(source);
	const resolved = resolveCanonicalJob(rawJson, itemIndex, platform);
	if (!resolved.ok) {
		return [{ type: "error", code: resolved.code, message: resolved.message }];
	}

	const job = resolved.job;
	assertExtensionSupportedPublishPolicy(job);

	const videoHandle = await tryFileHandle(
		source.assetsDir,
		basenameOfPath(job.assets.localVideoPath),
	);
	if (!videoHandle) {
		return [
			{
				type: "error",
				code: "video_not_found",
				message: `missing video: ${basenameOfPath(job.assets.localVideoPath)}`,
			},
		];
	}

	const maxDirectAttachBytes =
		job.policy?.maxDirectAttachBytes ?? DEFAULT_JOB_POLICY.maxDirectAttachBytes;
	const maxCoverInlineBytes =
		job.policy?.maxCoverInlineBytes ?? DEFAULT_JOB_POLICY.maxCoverInlineBytes;
	const transferChunkBytes = job.policy?.transferChunkBytes ?? DEFAULT_TRANSFER_CHUNK_BYTES;
	const jobJson = JSON.stringify(job);

	if (applyPhase === ApplyPhase.FieldsOnly) {
		const coverHandle = await getCoverFileHandle(source, job.assets.localCoverPath, false);
		const horizontalHandle =
			includeHorizontalCover === true
				? await getCoverFileHandle(source, job.assets.localCoverPath, true)
				: null;
		const cover = await resolveCover(coverHandle, maxCoverInlineBytes, transferChunkBytes);
		const horizontal =
			horizontalHandle === null
				? null
				: await resolveCover(
						horizontalHandle,
						maxCoverInlineBytes,
						transferChunkBytes,
						"coverHorizontal",
					);

		return buildApplyBatch({
			applyPhase,
			jobJson,
			batchItemIndex: itemIndex,
			targetPlatform: platform,
			video: { kind: "skipped", reasonCode: REASON_VIDEO_SKIPPED_FIELDS_PHASE },
			cover: cover.payload,
			coverHorizontal: horizontal?.payload,
			coverStreamBatch: cover.streamBatch,
			coverHorizontalStreamBatch: horizontal?.streamBatch,
		});
	}

	const video = await resolveVideo(videoHandle, maxDirectAttachBytes, transferChunkBytes);
	if (applyPhase === ApplyPhase.VideoOnly) {
		return buildApplyBatch({
			applyPhase,
			jobJson,
			batchItemIndex: itemIndex,
			targetPlatform: platform,
			video: video.payload,
			cover: { kind: "skipped", reasonCode: REASON_COVER_SKIPPED_VIDEO_PHASE },
			videoStreamBatch: video.streamBatch,
		});
	}

	const coverHandle = await getCoverFileHandle(source, job.assets.localCoverPath, false);
	const horizontalHandle =
		includeHorizontalCover === true
			? await getCoverFileHandle(source, job.assets.localCoverPath, true)
			: null;
	const cover = await resolveCover(coverHandle, maxCoverInlineBytes, transferChunkBytes);
	const horizontal =
		horizontalHandle === null
			? null
			: await resolveCover(
					horizontalHandle,
					maxCoverInlineBytes,
					transferChunkBytes,
					"coverHorizontal",
				);

	return buildApplyBatch({
		applyPhase,
		jobJson,
		batchItemIndex: itemIndex,
		targetPlatform: platform,
		video: video.payload,
		cover: cover.payload,
		coverHorizontal: horizontal?.payload,
		videoStreamBatch: video.streamBatch,
		coverStreamBatch: cover.streamBatch,
		coverHorizontalStreamBatch: horizontal?.streamBatch,
	});
}

export async function handleBrowserHostInboundMessage(
	inbound: HostInboundMessage,
	source: BrowserFileSource,
): Promise<HostOutboundBatch> {
	try {
		if (inbound.type === "ping") return [{ type: "pong" }];
		if (inbound.type === "inspectJobFromFile") return await inspectJobFromFile(source);
		if (inbound.type === "checkBatchJobAssetsFromFile") {
			return await checkBatchJobAssets(source, inbound.includeHorizontalCover);
		}
		return await applyJobFromFile(
			source,
			inbound.applyPhase,
			inbound.itemIndex,
			inbound.platform,
			inbound.includeHorizontalCover,
		);
	} catch (error: unknown) {
		return [
			{
				type: "error",
				code: "browser_source_error",
				message: error instanceof Error ? error.message : "browser_source_error",
			},
		];
	}
}

export { BROWSER_JOB_FILE_PATH };
