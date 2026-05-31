import {
	CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
	CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
} from "./channels-cover-selectors.js";

const CHANNELS_PAGE_COVER_WRAP_SELECTORS = [
	CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
	CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
] as const;

export function isChannelsPageCoverWrap(element: HTMLElement): boolean {
	for (const selector of CHANNELS_PAGE_COVER_WRAP_SELECTORS) {
		if (element.matches(selector)) return true;
		if (element.closest(selector)) return true;
	}
	return false;
}
