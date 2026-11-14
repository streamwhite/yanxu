import { basename } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";
import type { AttachmentVideoPayload, HostOutboundBatch } from "@yanxu/domain";
import { MAX_NATIVE_INLINE_VIDEO_BYTES } from "@yanxu/domain";
import { buildVideoAttachmentPayload } from "./build-video-payload.js";
import { chunkBufferToBase64 } from "./chunk-buffer-to-base64.js";
import { estimateStreamChunkBytes } from "./estimate-stream-chunk-bytes.js";
import { guessVideoMimeFromPath } from "../mime/guess-mime-from-path.js";

const REASON_OVER_POLICY = "over_max_direct_attach_bytes" as const;

export type ResolvedVideoAttachment =
	| { mode: "payload"; payload: AttachmentVideoPayload }
	| { mode: "stream"; streamBatch: HostOutboundBatch };

export async function resolveVideoAttachment(input: {
	absolutePath: string;
	maxDirectAttachBytes: number;
	transferChunkBytes: number;
}): Promise<ResolvedVideoAttachment> {
	await fsp.access(input.absolutePath, fsConstants.R_OK);
	const stat = await fsp.stat(input.absolutePath);
	if (!stat.isFile()) throw new Error("video_not_a_file");

	if (stat.size > input.maxDirectAttachBytes) {
		return {
			mode: "payload",
			payload: {
				kind: "manualLargeFile",
				absolutePath: input.absolutePath,
				sizeBytes: stat.size,
				reasonCode: REASON_OVER_POLICY,
				suggestedFileName: basename(input.absolutePath),
			},
		};
	}

	if (stat.size <= MAX_NATIVE_INLINE_VIDEO_BYTES) {
		const payload = await buildVideoAttachmentPayload(input);
		return { mode: "payload", payload };
	}

	const streamChunkBytes = estimateStreamChunkBytes(input.transferChunkBytes);
	const buffer = await fsp.readFile(input.absolutePath);
	const chunks = chunkBufferToBase64(buffer, streamChunkBytes);
	const mimeType = guessVideoMimeFromPath(input.absolutePath);
	const suggestedFileName = basename(input.absolutePath);

	const streamBatch: HostOutboundBatch = [
		{
			type: "videoStreamStart",
			mimeType,
			suggestedFileName,
			totalBytes: stat.size,
			chunkCount: chunks.length,
		},
	];

	for (let index = 0; index < chunks.length; index++) {
		const base64 = chunks[index];
		if (!base64) continue;
		streamBatch.push({ type: "videoStreamChunk", index, base64 });
	}

	return { mode: "stream", streamBatch };
}
