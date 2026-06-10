import { queryAllDeep } from "../../content/query-all-deep.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import {
	DOUYIN_COVER_FILTER_SELECTORS,
	DOUYIN_COVER_SELECT_TITLE,
	DOUYIN_COVER_TITLE_SELECTORS,
} from "./douyin-cover-selectors.js";
import {
	DOUYIN_COVER_HORIZONTAL_TIP_HINT,
	DOUYIN_COVER_VERTICAL_TIP_HINT,
	type DouyinCoverAspect,
} from "./douyin-cover-aspect.js";

const DOUYIN_COVER_CONTROL_SELECTOR = 'div[class*="coverControl-"]' as const;
const DOUYIN_COVER_TIP_SELECTOR = 'div[class*="cover-tip-"]' as const;

function resolveClickableFilter(titleEl: HTMLElement): HTMLElement {
	for (const selector of DOUYIN_COVER_FILTER_SELECTORS) {
		const filter = titleEl.closest(selector);
		if (filter instanceof HTMLElement && isElementVisible(filter)) return filter;
	}
	return titleEl;
}

function findSelectCoverTriggerInScope(scope: ParentNode): HTMLElement | null {
	for (const selector of DOUYIN_COVER_TITLE_SELECTORS) {
		for (const candidate of queryAllDeep(scope, selector)) {
			if (!isElementVisible(candidate)) continue;
			if (normalizeUiText(candidate.textContent) !== DOUYIN_COVER_SELECT_TITLE) continue;
			return resolveClickableFilter(candidate);
		}
	}
	return null;
}

function readCoverTipText(control: HTMLElement): string {
	const tip = control.querySelector(DOUYIN_COVER_TIP_SELECTOR);
	return normalizeUiText(tip?.textContent ?? "");
}

function coverControlMatchesAspect(control: HTMLElement, aspect: DouyinCoverAspect): boolean {
	const tip = readCoverTipText(control);
	if (aspect === "vertical") return tip.includes(DOUYIN_COVER_VERTICAL_TIP_HINT);
	if (tip.includes(DOUYIN_COVER_HORIZONTAL_TIP_HINT)) return true;
	return tip.length > 0 && !tip.includes(DOUYIN_COVER_VERTICAL_TIP_HINT);
}

function findDouyinCoverTriggerInControl(
	control: HTMLElement,
	aspect: DouyinCoverAspect,
): HTMLElement | null {
	if (!coverControlMatchesAspect(control, aspect)) return null;
	return findSelectCoverTriggerInScope(control);
}

export function findDouyinCoverTrigger(
	root: ParentNode,
	aspect: DouyinCoverAspect = "vertical",
): HTMLElement | null {
	const controls = queryAllDeep(root, DOUYIN_COVER_CONTROL_SELECTOR);
	if (controls.length > 0) {
		for (const control of controls) {
			if (!(control instanceof HTMLElement)) continue;
			const trigger = findDouyinCoverTriggerInControl(control, aspect);
			if (trigger) return trigger;
		}
		return null;
	}

	if (aspect !== "vertical") return null;
	return findSelectCoverTriggerInScope(root);
}
