import {
	BILIBILI_COVER_UPLOAD_TEXT,
	BILIBILI_VIDEO_UPLOAD_DRAG_TEXT,
} from "./bilibili-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

function isVideoUploadAreaText(text: string): boolean {
	if (text.includes(BILIBILI_VIDEO_UPLOAD_DRAG_TEXT)) return true;
	if (text.includes("视频拖拽")) return true;
	return text.includes("将视频拖拽");
}

export function uploadAreaLooksLikeCoverModal(area: HTMLElement): boolean {
	const uploadText = normalizeUiText(area.querySelector(".upload-text")?.textContent);
	if (uploadText && isVideoUploadAreaText(uploadText)) return false;
	if (uploadText === BILIBILI_COVER_UPLOAD_TEXT) return true;

	const fullText = normalizeUiText(area.textContent);
	if (isVideoUploadAreaText(fullText)) return false;
	return fullText.includes(BILIBILI_COVER_UPLOAD_TEXT);
}
