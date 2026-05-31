import {
	BILIBILI_CREATIVE_STATEMENT_INPUT_CLASS,
	BILIBILI_CREATIVE_STATEMENT_PLACEHOLDER_HINT,
	BILIBILI_CREATIVE_STATEMENT_SECTION_CLASS,
	BILIBILI_CREATIVE_STATEMENT_SELECT_CLASS,
} from "../../content/bilibili-selectors.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function selectFromInput(input: HTMLInputElement): HTMLElement | null {
	const select = input.closest(`.${BILIBILI_CREATIVE_STATEMENT_SELECT_CLASS}`);
	if (!(select instanceof HTMLElement)) return null;
	return isElementVisible(select) ? select : null;
}

export function findBilibiliCreativeStatementSelect(root: ParentNode): HTMLElement | null {
	for (const input of queryAllDeep(
		root,
		`input.${BILIBILI_CREATIVE_STATEMENT_INPUT_CLASS}[placeholder*="${BILIBILI_CREATIVE_STATEMENT_PLACEHOLDER_HINT}"]`,
	)) {
		if (!(input instanceof HTMLInputElement)) continue;
		const select = selectFromInput(input);
		if (select) return select;
	}

	for (const select of queryAllDeep(
		root,
		`.${BILIBILI_CREATIVE_STATEMENT_SECTION_CLASS} .${BILIBILI_CREATIVE_STATEMENT_SELECT_CLASS}`,
	)) {
		if (!isElementVisible(select)) continue;
		return select;
	}

	return null;
}

export function readBilibiliCreativeStatementMainValue(select: HTMLElement): string | null {
	const input = select.querySelector(`input.${BILIBILI_CREATIVE_STATEMENT_INPUT_CLASS}`);
	if (!(input instanceof HTMLInputElement)) return null;
	const value = normalizeUiText(input.value);
	return value || null;
}
