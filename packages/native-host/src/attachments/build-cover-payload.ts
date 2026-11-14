import { constants as fsConstants, promises as fsp } from "node:fs";
import type { AttachmentCoverPayload } from "@yanxu/domain";
import { guessImageMimeFromPath } from "../mime/guess-mime-from-path.js";

const REASON_NO_PATH = "no_cover_path" as const;
const REASON_TOO_LARGE = "cover_over_inline_limit" as const;

export async function buildCoverAttachmentPayload(input: {
	absolutePath?: string;
	maxCoverInlineBytes: number;
}): Promise<AttachmentCoverPayload> {
	if (!input.absolutePath) return { kind: "skipped", reasonCode: REASON_NO_PATH };

	await fsp.access(input.absolutePath, fsConstants.R_OK);
	const stat = await fsp.stat(input.absolutePath);
	if (!stat.isFile()) throw new Error("cover_not_a_file");
	if (stat.size > input.maxCoverInlineBytes) {
		return { kind: "skipped", reasonCode: REASON_TOO_LARGE };
	}

	const buffer = await fsp.readFile(input.absolutePath);
	return {
		kind: "inlineBase64",
		mimeType: guessImageMimeFromPath(input.absolutePath),
		base64: buffer.toString("base64"),
	};
}
