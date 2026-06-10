import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	CHANNELS_COVER_DIALOG_HOST_SELECTORS,
	CHANNELS_COVER_VERTICAL_CONFIRM_BTN_WRAP_SELECTOR,
	CHANNELS_COVER_VERTICAL_CONFIRM_TEXT,
} from "./channels-cover-selectors.js";
import { findChannelsCoverUploadDialog } from "./find-channels-cover-upload-dialog.js";

const CHANNELS_VERTICAL_CONFIRM_BTN_SELECTOR =
	"button.weui-desktop-btn_primary.weui-desktop-btn_mini" as const;

function collectCoverDialogScopes(root: ParentNode, dialog: HTMLElement): ParentNode[] {
	const scopes: ParentNode[] = [dialog];

	for (const selector of CHANNELS_COVER_DIALOG_HOST_SELECTORS) {
		const ancestor = dialog.closest(selector);
		if (ancestor instanceof HTMLElement && !scopes.includes(ancestor)) {
			scopes.push(ancestor);
		}
	}

	if (root instanceof Document && !scopes.includes(root)) {
		scopes.push(root);
	}

	return scopes;
}

function buttonMatchesVerticalConfirm(button: HTMLElement): boolean {
	return normalizeUiText(button.textContent) === CHANNELS_COVER_VERTICAL_CONFIRM_TEXT;
}

function findConfirmInScope(scope: ParentNode): HTMLElement | null {
	for (const wrap of queryAllDeep(scope, CHANNELS_COVER_VERTICAL_CONFIRM_BTN_WRAP_SELECTOR)) {
		if (!(wrap instanceof HTMLElement)) continue;
		const button = wrap.querySelector(CHANNELS_VERTICAL_CONFIRM_BTN_SELECTOR);
		if (!(button instanceof HTMLButtonElement)) continue;
		if (!isElementVisible(button)) continue;
		if (!buttonMatchesVerticalConfirm(button)) continue;
		return button;
	}

	const matches: HTMLElement[] = [];
	for (const button of queryAllDeep(scope, CHANNELS_VERTICAL_CONFIRM_BTN_SELECTOR)) {
		if (!(button instanceof HTMLButtonElement)) continue;
		if (!isElementVisible(button)) continue;
		if (!buttonMatchesVerticalConfirm(button)) continue;
		matches.push(button);
	}

	return matches.at(-1) ?? null;
}

export function findChannelsVerticalCoverConfirmButton(
	root: ParentNode = document,
): HTMLElement | null {
	const dialog = findChannelsCoverUploadDialog(root);
	if (!dialog) return null;

	for (const scope of collectCoverDialogScopes(root, dialog)) {
		const button = findConfirmInScope(scope);
		if (button) return button;
	}

	return null;
}
