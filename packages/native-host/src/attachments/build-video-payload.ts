import { basename } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";
import type { AttachmentVideoPayload } from "@yanxu/domain";
import { chunkBufferToBase64 } from "./chunk-buffer-to-base64.js";
import { guessVideoMimeFromPath } from "../mime/guess-mime-from-path.js";

const REASON_OVER_LIMIT = "over_max_direct_attach_bytes" as const;

export async function buildVideoAttachmentPayload(input: {
	absolutePath: string;
	maxDirectAttachBytes: number;
	transferChunkBytes: number;
}): Promise<AttachmentVideoPayload> {
	await fsp.access(input.absolutePath, fsConstants.R_OK);
	const stat = await fsp.stat(input.absolutePath);
	if (!stat.isFile()) throw new Error("video_not_a_file");

	if (stat.size > input.maxDirectAttachBytes) {
		return {
			kind: "manualLargeFile",
			absolutePath: input.absolutePath,
			sizeBytes: stat.size,
			reasonCode: REASON_OVER_LIMIT,
			suggestedFileName: basename(input.absolutePath),
		};
	}

	const buffer = await fsp.readFile(input.absolutePath);
	return {
		kind: "inlineBase64Chunks",
		mimeType: guessVideoMimeFromPath(input.absolutePath),
		chunks: chunkBufferToBase64(buffer, input.transferChunkBytes),
		suggestedFileName: basename(input.absolutePath),
	};
}
