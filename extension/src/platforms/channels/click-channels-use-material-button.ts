import { dispatchClick } from "../../content/dispatch-click.js";
import { waitForChannelsUseMaterialButton } from "./wait-for-channels-use-material-button.js";

/** Click 使用素材 on the horizontal cover reuse popover. */
export async function clickChannelsUseMaterialButton(
	root: ParentNode = document,
): Promise<boolean> {
	const button = await waitForChannelsUseMaterialButton(root);
	if (!button) return false;

	dispatchClick(button);

	const wrap = button.closest(".weui-desktop-btn_wrp.btn-use");
	if (wrap instanceof HTMLElement) {
		dispatchClick(wrap);
	}

	return true;
}
