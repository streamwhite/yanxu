import { clickModalConfirmByHints } from "../../content/click-modal-confirm-by-hints.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	CHANNELS_COVER_DIALOG_CONFIRM_HINTS,
	CHANNELS_COVER_POPOVER_CLOSE_SELECTORS,
} from "./channels-cover-selectors.js";
import { findChannelsCoverUploadDialog } from "./find-channels-cover-upload-dialog.js";

function clickVisiblePopoverClose(scope: ParentNode): boolean {
	for (const selector of CHANNELS_COVER_POPOVER_CLOSE_SELECTORS) {
		for (const candidate of queryAllDeep(scope, selector)) {
			if (!(candidate instanceof HTMLElement)) continue;
			if (!isElementVisible(candidate)) continue;
			dispatchClick(candidate);
			return true;
		}
	}
	return false;
}

/** Dismiss the open 视频号 cover popover after vertical cover is applied on the page wrap. */
export function closeChannelsCoverUploadDialog(root: ParentNode = document): boolean {
	const dialog = findChannelsCoverUploadDialog(root);
	if (!dialog) return true;

	if (clickModalConfirmByHints(dialog, CHANNELS_COVER_DIALOG_CONFIRM_HINTS)) return true;
	return clickVisiblePopoverClose(dialog);
}
