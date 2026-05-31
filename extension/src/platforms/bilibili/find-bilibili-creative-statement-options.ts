import {
	BILIBILI_CREATIVE_STATEMENT_AUTH_CLASS,
	BILIBILI_CREATIVE_STATEMENT_AUTH_TEXT_CLASS,
	BILIBILI_CREATIVE_STATEMENT_OPTION_CLASS,
} from "../../content/bilibili-selectors.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function optionLabelMatches(element: HTMLElement, targetValue: string): boolean {
	return normalizeUiText(element.textContent) === normalizeUiText(targetValue);
}

export function findBilibiliCreativeStatementMainOption(
	select: HTMLElement,
	targetValue: string,
): HTMLElement | null {
	for (const option of queryAllDeep(select, `li.${BILIBILI_CREATIVE_STATEMENT_OPTION_CLASS}`)) {
		const label = option.querySelector("span");
		if (!(label instanceof HTMLElement)) continue;
		if (!optionLabelMatches(label, targetValue)) continue;
		return option;
	}
	return null;
}

export function findBilibiliCreativeStatementAuthOption(
	select: HTMLElement,
	targetValue: string,
): HTMLElement | null {
	for (const auth of queryAllDeep(select, `.${BILIBILI_CREATIVE_STATEMENT_AUTH_CLASS}`)) {
		const label = auth.querySelector(`.${BILIBILI_CREATIVE_STATEMENT_AUTH_TEXT_CLASS}`);
		if (!(label instanceof HTMLElement)) continue;
		if (!optionLabelMatches(label, targetValue)) continue;
		return auth;
	}
	return null;
}

export function bilibiliCreativeStatementAuthLooksSelected(
	select: HTMLElement,
	targetValue: string,
): boolean {
	const auth = findBilibiliCreativeStatementAuthOption(select, targetValue);
	if (!auth) return false;

	if (auth.classList.contains("selected") || auth.classList.contains("bcc-option-selected")) {
		return true;
	}

	const tick = auth.querySelector(".bcc-icon-ic_MenuButton-tick");
	if (tick instanceof HTMLElement && isElementVisible(tick)) {
		const style = globalThis.getComputedStyle(tick);
		if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
			return true;
		}
	}

	return auth.getAttribute("aria-selected") === "true";
}
