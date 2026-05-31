import { queryAllDeep } from "../../content/query-all-deep.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import {
	DOUYIN_COVER_FILTER_SELECTORS,
	DOUYIN_COVER_SELECT_TITLE,
	DOUYIN_COVER_TITLE_SELECTORS,
} from "./douyin-cover-selectors.js";

function resolveClickableFilter(titleEl: HTMLElement): HTMLElement {
	for (const selector of DOUYIN_COVER_FILTER_SELECTORS) {
		const filter = titleEl.closest(selector);
		if (filter instanceof HTMLElement && isElementVisible(filter)) return filter;
	}
	return titleEl;
}

export function findDouyinCoverTrigger(root: ParentNode): HTMLElement | null {
	for (const selector of DOUYIN_COVER_TITLE_SELECTORS) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!isElementVisible(candidate)) continue;
			if (normalizeUiText(candidate.textContent) !== DOUYIN_COVER_SELECT_TITLE) continue;
			return resolveClickableFilter(candidate);
		}
	}
	return null;
}
