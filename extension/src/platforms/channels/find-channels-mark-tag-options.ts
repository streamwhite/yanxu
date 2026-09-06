import {
	CHANNELS_MARK_TAG_OPTION_MAIN_CLASS,
	CHANNELS_MARK_TAG_OPTION_SELECTOR,
} from "./channels-selectors.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function optionMainMatches(main: HTMLElement, targetValue: string): boolean {
	return normalizeUiText(main.textContent) === normalizeUiText(targetValue);
}

export function findChannelsMarkTagOption(
	select: HTMLElement,
	targetValue: string,
): HTMLElement | null {
	for (const option of queryAllDeep(select, CHANNELS_MARK_TAG_OPTION_SELECTOR)) {
		const main = option.querySelector(`.${CHANNELS_MARK_TAG_OPTION_MAIN_CLASS}`);
		if (!(main instanceof HTMLElement)) continue;
		if (!optionMainMatches(main, targetValue)) continue;
		return option;
	}
	return null;
}
