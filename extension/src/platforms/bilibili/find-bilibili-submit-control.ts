import {
	BILIBILI_SUBMIT_LABEL,
	BILIBILI_SUBMIT_REPORTER_ID,
} from "../constants/platform-submit-labels.js";
import { pickFirstVisibleElementDeep } from "../../content/dom.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

const BILIBILI_SUBMIT_SELECTORS = [
	`.submit-add[data-reporter-id="${BILIBILI_SUBMIT_REPORTER_ID}"]`,
	".submit-add",
] as const;

export function findBilibiliSubmitControl(root: ParentNode): HTMLElement | null {
	const bySelector = pickFirstVisibleElementDeep<HTMLElement>(root, BILIBILI_SUBMIT_SELECTORS);
	if (bySelector) return bySelector;

	for (const candidate of queryAllDeep(root, ".submit-add")) {
		if (normalizeUiText(candidate.textContent) !== BILIBILI_SUBMIT_LABEL) continue;
		return candidate;
	}

	return null;
}
