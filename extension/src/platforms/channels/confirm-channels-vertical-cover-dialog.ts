import { dispatchClick } from "../../content/dispatch-click.js";
import { findChannelsCoverUploadDialog } from "./find-channels-cover-upload-dialog.js";
import { waitForChannelsVerticalCoverConfirmButton } from "./wait-for-channels-vertical-cover-confirm-button.js";

/** Click 确认 on the vertical cover popover to commit and close it. */
export async function confirmChannelsVerticalCoverDialog(
	root: ParentNode = document,
): Promise<boolean> {
	if (!findChannelsCoverUploadDialog(root)) return true;

	const button = await waitForChannelsVerticalCoverConfirmButton(root);
	if (!button) return false;

	dispatchClick(button);

	const wrap = button.closest(".weui-desktop-btn_wrp");
	if (wrap instanceof HTMLElement) {
		dispatchClick(wrap);
	}

	return true;
}
