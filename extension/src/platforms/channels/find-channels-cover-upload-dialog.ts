import { queryAllDeep } from "../../content/query-all-deep.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { isImageFileInput } from "../../content/is-image-file-input.js";
import {
	CHANNELS_COVER_DIALOG_HOST_SELECTORS,
	CHANNELS_COVER_POPOVER_SELECTORS,
	CHANNELS_COVER_UPLOAD_CLICK_SELECTORS,
} from "./channels-cover-selectors.js";
import { isChannelsPageCoverWrap } from "./is-channels-page-cover-wrap.js";

function popoverHasImageFileInput(popover: HTMLElement): boolean {
	return queryAllDeep(popover, 'input[type="file"]').some(
		(element) => element instanceof HTMLInputElement && isImageFileInput(element),
	);
}

function popoverHasUploadClickTarget(popover: HTMLElement): boolean {
	for (const selector of CHANNELS_COVER_UPLOAD_CLICK_SELECTORS) {
		if (popover.querySelector(selector)) return true;
	}
	return false;
}

function popoverLooksLikeCoverUploadDialog(popover: HTMLElement): boolean {
	if (isChannelsPageCoverWrap(popover)) return false;
	if (popoverHasImageFileInput(popover)) return true;
	return popoverHasUploadClickTarget(popover);
}

function findPopoverFromImageFileInput(root: ParentNode): HTMLElement | null {
	for (const input of queryAllDeep(root, 'input[type="file"]')) {
		if (!(input instanceof HTMLInputElement)) continue;
		if (!isImageFileInput(input)) continue;
		if (!input.isConnected) continue;

		for (const selector of CHANNELS_COVER_DIALOG_HOST_SELECTORS) {
			const host = input.closest(selector);
			if (!(host instanceof HTMLElement)) continue;
			if (isChannelsPageCoverWrap(host)) continue;
			if (!isElementVisible(host)) continue;
			return host;
		}
	}
	return null;
}

export function findChannelsCoverUploadDialog(root: ParentNode): HTMLElement | null {
	const fromInput = findPopoverFromImageFileInput(root);
	if (fromInput) return fromInput;

	for (const selector of CHANNELS_COVER_POPOVER_SELECTORS) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!(candidate instanceof HTMLElement)) continue;
			if (!isElementVisible(candidate)) continue;
			if (!popoverLooksLikeCoverUploadDialog(candidate)) continue;
			return candidate;
		}
	}

	return null;
}
