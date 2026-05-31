import { dispatchClick } from "../../content/dispatch-click.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { waitMs } from "../../content/wait-ms.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import {
	BILIBILI_CREATIVE_STATEMENT_AFTER_OPEN_MS,
	BILIBILI_CREATIVE_STATEMENT_AFTER_PICK_MS,
} from "./constants/bilibili-creative-statement-timing.js";
import { findBilibiliCreativeStatementSelect } from "./find-bilibili-creative-statement-select.js";
import { readBilibiliCreativeStatementMainValue } from "./find-bilibili-creative-statement-select.js";
import {
	bilibiliCreativeStatementAuthLooksSelected,
	findBilibiliCreativeStatementAuthOption,
	findBilibiliCreativeStatementMainOption,
} from "./find-bilibili-creative-statement-options.js";

function isDropdownOpen(select: HTMLElement): boolean {
	const listWrap = select.querySelector(".bcc-select-list-wrap");
	if (!(listWrap instanceof HTMLElement)) return false;
	return isElementVisible(listWrap);
}

async function openDropdown(select: HTMLElement): Promise<void> {
	if (isDropdownOpen(select)) return;

	const inputWrap = select.querySelector(".bcc-select-input-wrap");
	if (!(inputWrap instanceof HTMLElement)) return;

	dispatchClick(inputWrap);
	await waitMs(BILIBILI_CREATIVE_STATEMENT_AFTER_OPEN_MS);
}

function mainSelectionMatches(select: HTMLElement, targetValue: string): boolean {
	const current = readBilibiliCreativeStatementMainValue(select);
	if (!current) return false;
	return normalizeUiText(current) === normalizeUiText(targetValue);
}

function selectionMatches(
	select: HTMLElement,
	statementOption: string,
	statementAuth: string,
): boolean {
	return (
		mainSelectionMatches(select, statementOption) &&
		bilibiliCreativeStatementAuthLooksSelected(select, statementAuth)
	);
}

async function clickMainOption(
	select: HTMLElement,
	statementOption: string,
): Promise<boolean> {
	const option = findBilibiliCreativeStatementMainOption(select, statementOption);
	if (!option) return false;

	dispatchClick(option);
	await waitMs(BILIBILI_CREATIVE_STATEMENT_AFTER_PICK_MS);
	return mainSelectionMatches(select, statementOption);
}

async function clickAuthOption(select: HTMLElement, statementAuth: string): Promise<boolean> {
	const auth = findBilibiliCreativeStatementAuthOption(select, statementAuth);
	if (!auth) return false;

	dispatchClick(auth);
	await waitMs(BILIBILI_CREATIVE_STATEMENT_AFTER_PICK_MS);
	return bilibiliCreativeStatementAuthLooksSelected(select, statementAuth);
}

export async function selectBilibiliCreativeStatementValue(
	root: ParentNode,
	statementOption: string,
	statementAuth: string,
): Promise<boolean> {
	const select = findBilibiliCreativeStatementSelect(root);
	if (!select) return false;

	if (selectionMatches(select, statementOption, statementAuth)) return true;

	await openDropdown(select);

	if (!mainSelectionMatches(select, statementOption)) {
		if (!(await clickMainOption(select, statementOption))) return false;
		if (!isDropdownOpen(select)) await openDropdown(select);
	}

	if (!bilibiliCreativeStatementAuthLooksSelected(select, statementAuth)) {
		if (!isDropdownOpen(select)) await openDropdown(select);
		if (!(await clickAuthOption(select, statementAuth))) return false;
	}

	return selectionMatches(select, statementOption, statementAuth);
}
