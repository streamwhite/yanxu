import { DOUYIN_SUBMIT_LABEL } from "../constants/platform-submit-labels.js";
import { findClickableByTextHint } from "../../content/find-clickable-by-text-hint.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

export function findDouyinSubmitControl(root: ParentNode): HTMLElement | null {
	const byHint = findClickableByTextHint(root, DOUYIN_SUBMIT_LABEL);
	if (byHint && isElementVisible(byHint)) return byHint;

	for (const candidate of queryAllDeep(root, "button")) {
		if (normalizeUiText(candidate.textContent) !== DOUYIN_SUBMIT_LABEL) continue;
		if (!isElementVisible(candidate)) continue;
		return candidate;
	}

	return null;
}
