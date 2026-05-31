import { queryAllDeep } from "../../content/query-all-deep.js";
import { DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR } from "./douyin-cover-selectors.js";
import { findDouyinCoverDragMainText } from "./wait-for-douyin-cover-drag-main-text.js";

export function findDouyinCoverDragArea(modal: ParentNode): HTMLElement | null {
	const mainText = findDouyinCoverDragMainText(modal);
	if (mainText) {
		const fromMainText = mainText.closest(DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR);
		if (fromMainText instanceof HTMLElement) return fromMainText;
	}

	for (const candidate of queryAllDeep(modal, DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR)) {
		if (!(candidate instanceof HTMLElement)) continue;
		if (!candidate.isConnected) continue;
		if (!findDouyinCoverDragMainText(candidate)) continue;
		return candidate;
	}

	return null;
}
