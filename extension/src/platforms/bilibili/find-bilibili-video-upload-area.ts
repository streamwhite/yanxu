import { queryAllDeep } from "../../content/query-all-deep.js";
import { uploadAreaFromVideoInput } from "../../content/upload-area-from-video-input.js";
import { uploadAreaLooksLikeCoverModal } from "../../content/upload-area-looks-like-cover-modal.js";
import {
	BILIBILI_VIDEO_FILE_INPUT_SELECTORS,
	BILIBILI_VIDEO_UPLOAD_DRAG_TEXT,
} from "../../content/bilibili-selectors.js";
import { collectVideoFileInputs } from "../../content/collect-video-file-inputs.js";

const BILIBILI_UPLOAD_AREA_SELECTOR = ".upload-area" as const;

function uploadAreaLooksLikeVideoPicker(area: HTMLElement): boolean {
	if (uploadAreaLooksLikeCoverModal(area)) return false;
	const text = area.textContent ?? "";
	return text.includes(BILIBILI_VIDEO_UPLOAD_DRAG_TEXT);
}

export function findBilibiliVideoUploadArea(root: ParentNode): HTMLElement | null {
	for (const input of collectVideoFileInputs(root, BILIBILI_VIDEO_FILE_INPUT_SELECTORS)) {
		const area = uploadAreaFromVideoInput(input, BILIBILI_UPLOAD_AREA_SELECTOR);
		if (uploadAreaLooksLikeVideoPicker(area)) return area;
	}

	for (const area of queryAllDeep(root, BILIBILI_UPLOAD_AREA_SELECTOR)) {
		if (uploadAreaLooksLikeVideoPicker(area)) return area;
	}

	return null;
}
