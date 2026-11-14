import { collectVideoFileInputs } from "../../content/collect-video-file-inputs.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import { uploadAreaFromVideoInput } from "../../content/upload-area-from-video-input.js";
import {
	CHANNELS_VIDEO_FILE_INPUT_SELECTORS,
	CHANNELS_VIDEO_UPLOAD_AREA_SELECTORS,
	CHANNELS_VIDEO_UPLOAD_DURATION_HINT,
	CHANNELS_VIDEO_UPLOAD_RECENT_HINT,
	CHANNELS_VIDEO_UPLOAD_SIZE_HINT,
	CHANNELS_VIDEO_UPLOAD_TIP_TEXT_HINT,
} from "./channels-selectors.js";

const CHANNELS_UPLOAD_CONTENT_SELECTOR = ".upload-content" as const;

const CHANNELS_VIDEO_UPLOAD_TEXT_HINTS = [
	CHANNELS_VIDEO_UPLOAD_TIP_TEXT_HINT,
	CHANNELS_VIDEO_UPLOAD_DURATION_HINT,
	CHANNELS_VIDEO_UPLOAD_SIZE_HINT,
	CHANNELS_VIDEO_UPLOAD_RECENT_HINT,
] as const;

export function uploadAreaTextLooksLikeVideoPicker(area: HTMLElement): boolean {
	const text = area.textContent ?? "";
	return CHANNELS_VIDEO_UPLOAD_TEXT_HINTS.some((hint) => text.includes(hint));
}

function resolveUploadAreaFromTip(tip: HTMLElement): HTMLElement | null {
	const fromContent = tip.closest(".upload-content");
	if (fromContent instanceof HTMLElement) return fromContent;
	return tip;
}

export function findChannelsVideoUploadArea(root: ParentNode): HTMLElement | null {
	for (const input of collectVideoFileInputs(root, CHANNELS_VIDEO_FILE_INPUT_SELECTORS)) {
		const area = uploadAreaFromVideoInput(input, CHANNELS_UPLOAD_CONTENT_SELECTOR);
		if (uploadAreaTextLooksLikeVideoPicker(area)) return area;
	}

	for (const selector of CHANNELS_VIDEO_UPLOAD_AREA_SELECTORS) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!uploadAreaTextLooksLikeVideoPicker(candidate)) continue;
			return candidate;
		}
	}

	for (const tip of queryAllDeep(root, ".upload-tip")) {
		if (!uploadAreaTextLooksLikeVideoPicker(tip)) continue;
		return resolveUploadAreaFromTip(tip);
	}

	return null;
}
