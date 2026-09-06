import { dispatchClick } from "../../content/dispatch-click.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { waitMs } from "../../content/wait-ms.js";
import { CHANNELS_MARK_TAG_OPTIONS_SELECTOR } from "./channels-selectors.js";
import {
	CHANNELS_MARK_TAG_AFTER_OPEN_MS,
	CHANNELS_MARK_TAG_AFTER_PICK_MS,
} from "./constants/channels-mark-tag-timing.js";
import { findChannelsMarkTagOption } from "./find-channels-mark-tag-options.js";
import {
	findChannelsMarkTagSelect,
	readChannelsMarkTagValue,
} from "./find-channels-mark-tag-select.js";

function isDropdownOpen(select: HTMLElement): boolean {
	const options = select.querySelector(CHANNELS_MARK_TAG_OPTIONS_SELECTOR);
	if (!(options instanceof HTMLElement)) return false;
	return isElementVisible(options);
}

async function openDropdown(select: HTMLElement): Promise<void> {
	if (isDropdownOpen(select)) return;

	const display = select.querySelector(".select-display");
	if (!(display instanceof HTMLElement)) return;

	dispatchClick(display);
	await waitMs(CHANNELS_MARK_TAG_AFTER_OPEN_MS);
}

function selectionMatches(select: HTMLElement, targetValue: string): boolean {
	const current = readChannelsMarkTagValue(select);
	if (!current) return false;
	return normalizeUiText(current) === normalizeUiText(targetValue);
}

async function clickOption(select: HTMLElement, targetValue: string): Promise<boolean> {
	const option = findChannelsMarkTagOption(select, targetValue);
	if (!option) return false;

	dispatchClick(option);
	await waitMs(CHANNELS_MARK_TAG_AFTER_PICK_MS);
	return selectionMatches(select, targetValue);
}

export async function selectChannelsMarkTagValue(
	root: ParentNode,
	targetValue: string,
): Promise<boolean> {
	const select = findChannelsMarkTagSelect(root);
	if (!select) return false;

	if (selectionMatches(select, targetValue)) return true;

	await openDropdown(select);
	if (!(await clickOption(select, targetValue))) return false;

	return selectionMatches(select, targetValue);
}
