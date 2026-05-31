import { collectVideoFileInputs } from "../../content/collect-video-file-inputs.js";
import { findVideoFileInputNearUploadArea } from "../../content/find-video-file-input-near-upload-area.js";
import {
	BILIBILI_VIDEO_FILE_INPUT_SELECTORS,
	BILIBILI_VIDEO_UPLOAD_DRAG_TEXT,
} from "../../content/bilibili-selectors.js";
import { findBilibiliVideoUploadArea } from "./find-bilibili-video-upload-area.js";
import { uploadAreaLooksLikeCoverModal } from "../../content/upload-area-looks-like-cover-modal.js";

function inputBelongsToBilibiliVideoUpload(input: HTMLInputElement): boolean {
	const area = input.closest(".upload-area");
	if (!(area instanceof HTMLElement)) return false;
	if (uploadAreaLooksLikeCoverModal(area)) return false;
	return (area.textContent ?? "").includes(BILIBILI_VIDEO_UPLOAD_DRAG_TEXT);
}

export function findBilibiliVideoFileInput(root: ParentNode): HTMLInputElement | null {
	for (const input of collectVideoFileInputs(root, BILIBILI_VIDEO_FILE_INPUT_SELECTORS)) {
		if (inputBelongsToBilibiliVideoUpload(input)) return input;
	}

	const uploadArea = findBilibiliVideoUploadArea(root);
	if (!uploadArea) return null;

	return findVideoFileInputNearUploadArea(uploadArea);
}
