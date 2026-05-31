import { collectVideoFileInputs } from "../../content/collect-video-file-inputs.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	DOUYIN_UPLOAD_AREA_SELECTORS,
	DOUYIN_UPLOAD_CARD_TEXT_HINT,
	DOUYIN_VIDEO_FILE_INPUT_SELECTORS,
} from "./douyin-selectors.js";

function siblingUploadCard(input: HTMLInputElement): HTMLElement | null {
	const parent = input.parentElement;
	if (!parent) return null;

	const card = parent.querySelector('[class*="upload-card"]');
	return card instanceof HTMLElement ? card : null;
}

function uploadAreaFromFileInput(input: HTMLInputElement): HTMLElement | null {
	const card = input.closest('[class*="upload-card"]') ?? siblingUploadCard(input);
	if (card instanceof HTMLElement) return card;

	const btn = input.closest('[class*="upload-btn"]');
	if (btn instanceof HTMLElement) return btn;

	return input;
}

function uploadAreaHasCardHint(area: HTMLElement): boolean {
	return area.textContent?.includes(DOUYIN_UPLOAD_CARD_TEXT_HINT) ?? false;
}

export function findDouyinVideoUploadArea(root: ParentNode): HTMLElement | null {
	const input = collectVideoFileInputs(root, DOUYIN_VIDEO_FILE_INPUT_SELECTORS)[0];
	if (input) return uploadAreaFromFileInput(input);

	for (const selector of DOUYIN_UPLOAD_AREA_SELECTORS) {
		for (const area of queryAllDeep(root, selector)) {
			if (uploadAreaHasCardHint(area)) return area;
		}
	}

	return null;
}
