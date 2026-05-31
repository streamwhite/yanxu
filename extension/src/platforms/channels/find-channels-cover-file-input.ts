import { queryAllDeep } from "../../content/query-all-deep.js";
import { isImageFileInput } from "../../content/is-image-file-input.js";
import { isChannelsPageCoverWrap } from "./is-channels-page-cover-wrap.js";
import {
	CHANNELS_COVER_DIALOG_HOST_SELECTORS,
	CHANNELS_COVER_UPLOAD_CLICK_SELECTORS,
} from "./channels-cover-selectors.js";

function collectImageInputs(scope: ParentNode): HTMLInputElement[] {
	return queryAllDeep(scope, 'input[type="file"]').filter(
		(element): element is HTMLInputElement =>
			element instanceof HTMLInputElement && isImageFileInput(element),
	);
}

function isCoverUploadInput(input: HTMLInputElement): boolean {
	for (const selector of CHANNELS_COVER_DIALOG_HOST_SELECTORS) {
		const host = input.closest(selector);
		if (host instanceof HTMLElement && !isChannelsPageCoverWrap(host)) return true;
	}

	for (const selector of CHANNELS_COVER_UPLOAD_CLICK_SELECTORS) {
		if (input.closest(selector)) return true;
	}

	return false;
}

export function findChannelsCoverFileInput(scope: ParentNode): HTMLInputElement | null {
	for (const input of collectImageInputs(scope)) {
		if (isCoverUploadInput(input)) return input;
	}

	return collectImageInputs(scope)[0] ?? null;
}
