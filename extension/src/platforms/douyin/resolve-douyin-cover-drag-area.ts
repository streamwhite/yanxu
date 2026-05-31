import { DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR } from "./douyin-cover-selectors.js";
import { findDouyinCoverDragArea } from "./find-douyin-cover-drag-area.js";

export function resolveDouyinCoverDragArea(
	modal: ParentNode,
	clickTarget: HTMLElement | null,
): HTMLElement | null {
	if (clickTarget) {
		const fromTarget = clickTarget.closest(DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR);
		if (fromTarget instanceof HTMLElement) return fromTarget;
	}

	return findDouyinCoverDragArea(modal);
}
