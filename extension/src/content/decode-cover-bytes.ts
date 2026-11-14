import type { AttachmentCoverPayload } from "@yanxu/domain";
import { decodeBase64ChunksToUint8, decodeBase64ToUint8 } from "./binary.js";

export function decodeCoverAttachmentBytes(cover: AttachmentCoverPayload): Uint8Array {
	if (cover.kind === "inlineBase64Chunks") {
		return decodeBase64ChunksToUint8(cover.chunks);
	}

	if (cover.kind === "inlineBase64") {
		return decodeBase64ToUint8(cover.base64);
	}

	throw new Error("cover_attachment_not_decodable");
}
