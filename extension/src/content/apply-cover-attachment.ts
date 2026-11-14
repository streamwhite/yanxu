import type { AppliedJobPayload, AttachmentCoverPayload } from "@yanxu/domain";
import { applyCoverWithRetry } from "./apply-cover-with-retry.js";
import { decodeCoverAttachmentBytes } from "./decode-cover-bytes.js";

const COVER_FILE_NAME_PNG = "cover.png" as const;
const COVER_FILE_NAME_JPG = "cover.jpg" as const;
const HORIZONTAL_COVER_FILE_NAME_PNG = "cover-4x3.png" as const;
const HORIZONTAL_COVER_FILE_NAME_JPG = "cover-4x3.jpg" as const;
const MIME_PNG = "png" as const;

function decodeCoverFile(
	cover: AttachmentCoverPayload,
	fileNamePng: string,
	fileNameJpg: string,
): File {
	if (cover.kind === "skipped") throw new Error("cover_attachment_not_decodable");

	let bytes: Uint8Array;
	try {
		bytes = decodeCoverAttachmentBytes(cover);
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "cover_decode_failed";
		throw new Error(`cover_base64_invalid:${detail}`);
	}
	const fileName = cover.mimeType.includes(MIME_PNG) ? fileNamePng : fileNameJpg;
	return new File([bytes as BlobPart], fileName, { type: cover.mimeType });
}

export async function applyCoverAttachment(payload: AppliedJobPayload): Promise<void> {
	const cover = payload.attachments.cover;
	if (cover.kind === "skipped") return;

	const file = decodeCoverFile(cover, COVER_FILE_NAME_PNG, COVER_FILE_NAME_JPG);

	const horizontal = payload.attachments.coverHorizontal;
	const horizontalFile =
		horizontal && horizontal.kind !== "skipped"
			? decodeCoverFile(horizontal, HORIZONTAL_COVER_FILE_NAME_PNG, HORIZONTAL_COVER_FILE_NAME_JPG)
			: undefined;

	const applied = await applyCoverWithRetry(file, payload.batch.targetPlatform, horizontalFile);
	if (!applied) throw new Error(`cover_modal_upload_failed:${payload.batch.targetPlatform}`);
}

