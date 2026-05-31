import { DOUYIN_COVER_SEMI_DRAG_MAIN_TEXT_SELECTOR } from "../platforms/douyin/douyin-cover-selectors.js";
import { dispatchClick } from "./dispatch-click.js";

export function clickCoverUploadArea(uploadArea: HTMLElement): void {
	const semiMain = uploadArea.querySelector(DOUYIN_COVER_SEMI_DRAG_MAIN_TEXT_SELECTOR);
	if (semiMain instanceof HTMLElement) {
		dispatchClick(semiMain);
		return;
	}

	if (
		uploadArea.classList.contains("semi-upload-drag-area") ||
		uploadArea.matches('[class*="semi-upload-drag-area"]')
	) {
		dispatchClick(uploadArea);
		return;
	}

	const uploadText = uploadArea.querySelector(".upload-text");
	if (uploadText instanceof HTMLElement) {
		dispatchClick(uploadText);
		return;
	}

	const mainText = uploadArea.querySelector(".main-text");
	if (mainText instanceof HTMLElement) {
		dispatchClick(mainText);
		return;
	}

	dispatchClick(uploadArea);
}
