import { BILIBILI_COVER_UPLOAD_TEXT } from "./bilibili-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

export function uploadAreaLooksLikeCoverModal(area: HTMLElement): boolean {
	const uploadText = area.querySelector(".upload-text");
	if (normalizeUiText(uploadText?.textContent) === BILIBILI_COVER_UPLOAD_TEXT) {
		return true;
	}

	return (area.textContent ?? "").includes(BILIBILI_COVER_UPLOAD_TEXT);
}
