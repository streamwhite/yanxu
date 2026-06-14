import {
	DOUYIN_SUBMIT_CONTAINER_ID,
	DOUYIN_SUBMIT_LABEL,
} from "../constants/platform-submit-labels.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

const DOUYIN_SUBMIT_SELECTORS = [
	`#${DOUYIN_SUBMIT_CONTAINER_ID} button`,
	'button[class*="primary-"][class*="fixed-"]',
] as const;

function matchesDouyinSubmitLabel(element: HTMLElement): boolean {
	return normalizeUiText(element.textContent) === DOUYIN_SUBMIT_LABEL;
}

function findVisibleDouyinSubmitBySelectors(root: ParentNode): HTMLElement | null {
	for (const selector of DOUYIN_SUBMIT_SELECTORS) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!matchesDouyinSubmitLabel(candidate)) continue;
			if (!isElementVisible(candidate)) continue;
			return candidate;
		}
	}
	return null;
}

export function findDouyinSubmitControl(root: ParentNode): HTMLElement | null {
	const bySelector = findVisibleDouyinSubmitBySelectors(root);
	if (bySelector) return bySelector;

	for (const candidate of queryAllDeep(root, "button")) {
		if (!matchesDouyinSubmitLabel(candidate)) continue;
		if (!isElementVisible(candidate)) continue;
		return candidate;
	}

	return null;
}
