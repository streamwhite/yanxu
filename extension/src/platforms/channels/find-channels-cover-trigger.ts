import { pickFirstVisibleElementDeep } from "../../content/dom.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import {
	CHANNELS_COVER_EDIT_BTN_SELECTOR,
	CHANNELS_COVER_EDIT_TEXT,
	CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
} from "./channels-cover-selectors.js";

const CHANNELS_COVER_WRAP_SELECTORS = [CHANNELS_VERTICAL_COVER_WRAP_SELECTOR] as const;

function findEditBtnInWrap(wrap: HTMLElement): HTMLElement | null {
	for (const edit of Array.from(wrap.querySelectorAll(CHANNELS_COVER_EDIT_BTN_SELECTOR))) {
		if (!(edit instanceof HTMLElement)) continue;
		if (!isElementVisible(edit)) continue;
		if (normalizeUiText(edit.textContent) !== CHANNELS_COVER_EDIT_TEXT) continue;
		return edit;
	}
	return null;
}

export function findChannelsCoverTriggerInWrap(
	root: ParentNode,
	wrapSelector: string,
): HTMLElement | null {
	const wrap = pickFirstVisibleElementDeep(root, [wrapSelector]);
	if (!wrap) return null;
	return findEditBtnInWrap(wrap);
}

export function findChannelsCoverTrigger(root: ParentNode): HTMLElement | null {
	for (const wrapSelector of CHANNELS_COVER_WRAP_SELECTORS) {
		const edit = findChannelsCoverTriggerInWrap(root, wrapSelector);
		if (edit) return edit;
	}
	return null;
}
