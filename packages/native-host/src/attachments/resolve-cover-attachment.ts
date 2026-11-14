import { basename } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";
import type { AttachmentCoverPayload, HostOutboundBatch } from "@yanxu/domain";
import { MAX_NATIVE_INLINE_COVER_BYTES } from "@yanxu/domain";
import { chunkBufferToBase64 } from "./chunk-buffer-to-base64.js";
import { estimateStreamChunkBytes } from "./estimate-stream-chunk-bytes.js";
import { guessImageMimeFromPath } from "../mime/guess-mime-from-path.js";

const REASON_NO_PATH = "no_cover_path" as const;
const REASON_TOO_LARGE = "cover_over_inline_limit" as const;

const COVER_STREAM_MESSAGE_KINDS = {
	cover: { start: "coverStreamStart", chunk: "coverStreamChunk" },
	coverHorizontal: {
		start: "horizontalCoverStreamStart",
		chunk: "horizontalCoverStreamChunk",
	},
} as const;

export type CoverStreamKind = keyof typeof COVER_STREAM_MESSAGE_KINDS;

export type ResolvedCoverAttachment =
	| { mode: "payload"; payload: AttachmentCoverPayload }
	| { mode: "stream"; streamBatch: HostOutboundBatch };

async function readCoverInline(absolutePath: string): Promise<AttachmentCoverPayload> {
	const buffer = await fsp.readFile(absolutePath);
	return {
		kind: "inlineBase64",
		mimeType: guessImageMimeFromPath(absolutePath),
		base64: buffer.toString("base64"),
	};
}

export async function resolveCoverAttachment(input: {
	absolutePath?: string;
	maxCoverInlineBytes: number;
	transferChunkBytes: number;
	streamKind?: CoverStreamKind;
}): Promise<ResolvedCoverAttachment> {
	const messageKinds = COVER_STREAM_MESSAGE_KINDS[input.streamKind ?? "cover"];
	if (!input.absolutePath) {
		return { mode: "payload", payload: { kind: "skipped", reasonCode: REASON_NO_PATH } };
	}

	await fsp.access(input.absolutePath, fsConstants.R_OK);
	const stat = await fsp.stat(input.absolutePath);
	if (!stat.isFile()) throw new Error("cover_not_a_file");

	if (stat.size > input.maxCoverInlineBytes) {
		return { mode: "payload", payload: { kind: "skipped", reasonCode: REASON_TOO_LARGE } };
	}

	if (stat.size <= MAX_NATIVE_INLINE_COVER_BYTES) {
		const payload = await readCoverInline(input.absolutePath);
		return { mode: "payload", payload };
	}

	const streamChunkBytes = estimateStreamChunkBytes(input.transferChunkBytes);
	const buffer = await fsp.readFile(input.absolutePath);
	const chunks = chunkBufferToBase64(buffer, streamChunkBytes);
	const mimeType = guessImageMimeFromPath(input.absolutePath);
	const suggestedFileName = basename(input.absolutePath);

	const streamBatch: HostOutboundBatch = [
		{
			type: messageKinds.start,
			mimeType,
			suggestedFileName,
			totalBytes: stat.size,
			chunkCount: chunks.length,
		},
	];

	for (let index = 0; index < chunks.length; index++) {
		const base64 = chunks[index];
		if (!base64) continue;
		streamBatch.push({ type: messageKinds.chunk, index, base64 });
	}

	return { mode: "stream", streamBatch };
}
