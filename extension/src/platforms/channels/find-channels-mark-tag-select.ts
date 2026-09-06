import {
	CHANNELS_MARK_TAG_PLACEHOLDER_CLASS,
	CHANNELS_MARK_TAG_SELECT_SELECTORS,
	CHANNELS_MARK_TAG_SELECT_SELECTOR,
	CHANNELS_MARK_TAG_WRAPPER_SELECTOR,
} from "./channels-selectors.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function selectFromDisplay(display: HTMLElement): HTMLElement | null {
	const select = display.closest(CHANNELS_MARK_TAG_SELECT_SELECTOR);
	if (!(select instanceof HTMLElement)) return null;
	return isElementVisible(select) ? select : null;
}

export function findChannelsMarkTagSelect(root: ParentNode): HTMLElement | null {
	for (const display of queryAllDeep(root, ".select-display")) {
		const select = selectFromDisplay(display);
		if (select) return select;
	}

	for (const select of queryAllDeep(root, CHANNELS_MARK_TAG_SELECT_SELECTORS.join(", "))) {
		if (!isElementVisible(select)) continue;
		return select;
	}

	for (const wrapper of queryAllDeep(root, CHANNELS_MARK_TAG_WRAPPER_SELECTOR)) {
		const select = wrapper.querySelector(CHANNELS_MARK_TAG_SELECT_SELECTOR);
		if (select instanceof HTMLElement && isElementVisible(select)) return select;
	}

	return null;
}

export function readChannelsMarkTagValue(select: HTMLElement): string | null {
	const display = select.querySelector(`.${CHANNELS_MARK_TAG_PLACEHOLDER_CLASS}`);
	if (display instanceof HTMLElement && isElementVisible(display)) return null;

	const displayBox = select.querySelector(".select-display");
	if (!(displayBox instanceof HTMLElement)) return null;
	const value = normalizeUiText(displayBox.textContent);
	return value || null;
}
