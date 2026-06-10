import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	CHANNELS_COVER_USE_MATERIAL_BTN_SELECTOR,
	CHANNELS_COVER_USE_MATERIAL_BTN_WRAP_SELECTOR,
	CHANNELS_COVER_USE_MATERIAL_TEXT,
} from "./channels-cover-selectors.js";

function buttonMatchesUseMaterial(button: HTMLElement): boolean {
	return normalizeUiText(button.textContent) === CHANNELS_COVER_USE_MATERIAL_TEXT;
}

export function findChannelsUseMaterialButton(root: ParentNode = document): HTMLElement | null {
	for (const wrap of queryAllDeep(root, CHANNELS_COVER_USE_MATERIAL_BTN_WRAP_SELECTOR)) {
		if (!(wrap instanceof HTMLElement)) continue;
		if (!isElementVisible(wrap)) continue;
		const button = wrap.querySelector(CHANNELS_COVER_USE_MATERIAL_BTN_SELECTOR);
		if (!(button instanceof HTMLButtonElement)) continue;
		if (!isElementVisible(button)) continue;
		if (!buttonMatchesUseMaterial(button)) continue;
		return button;
	}

	for (const button of queryAllDeep(root, CHANNELS_COVER_USE_MATERIAL_BTN_SELECTOR)) {
		if (!(button instanceof HTMLButtonElement)) continue;
		if (!isElementVisible(button)) continue;
		if (!buttonMatchesUseMaterial(button)) continue;
		return button;
	}

	return null;
}
