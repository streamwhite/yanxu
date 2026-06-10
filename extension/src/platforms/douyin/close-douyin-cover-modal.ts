import { clickModalConfirmByHints } from "../../content/click-modal-confirm-by-hints.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import { findDouyinCoverModalBody } from "./find-douyin-cover-modal-body.js";

const DOUYIN_COVER_CONFIRM_BUTTON_HINTS = ["确定", "完成", "确认"] as const;

const DOUYIN_COVER_CLOSE_SELECTORS = [
	'[class*="semi-modal-close"]',
	'[class*="modal-close"]',
	'button[aria-label="Close"]',
	'button[aria-label="关闭"]',
] as const;

function clickVisibleCloseControl(scope: ParentNode): boolean {
	for (const selector of DOUYIN_COVER_CLOSE_SELECTORS) {
		for (const candidate of queryAllDeep(scope, selector)) {
			if (!(candidate instanceof HTMLElement)) continue;
			if (!isElementVisible(candidate)) continue;
			dispatchClick(candidate);
			return true;
		}
	}
	return false;
}

/** Dismiss the open Douyin cover modal after vertical cover upload. */
export function closeDouyinCoverModal(root: ParentNode = document): boolean {
	const modal = findDouyinCoverModalBody(root);
	const scope = modal ?? root;

	if (clickModalConfirmByHints(scope, DOUYIN_COVER_CONFIRM_BUTTON_HINTS)) return true;
	return clickVisibleCloseControl(scope);
}
