import type { AppliedJobPayload } from "@auto-upload/domain";
import { applyCoverViaModal } from "./apply-cover-via-modal.js";
import { decodeCoverAttachmentBytes } from "./decode-cover-bytes.js";

const COVER_FILE_NAME_PNG = "cover.png" as const;
const COVER_FILE_NAME_JPG = "cover.jpg" as const;
const MIME_PNG = "png" as const;

export async function applyCoverAttachment(payload: AppliedJobPayload): Promise<void> {
	const cover = payload.attachments.cover;
	if (cover.kind === "skipped") return;

	let bytes: Uint8Array;
	try {
		bytes = decodeCoverAttachmentBytes(cover);
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "cover_decode_failed";
		throw new Error(`cover_base64_invalid:${detail}`);
	}

	const fileName = cover.mimeType.includes(MIME_PNG) ? COVER_FILE_NAME_PNG : COVER_FILE_NAME_JPG;
	const file = new File([bytes], fileName, { type: cover.mimeType });

	const applied = await applyCoverViaModal(document, file);
	if (!applied) throw new Error("cover_modal_upload_failed");
}
