import { findDouyinCoverDragArea } from "./find-douyin-cover-drag-area.js";
import { findDouyinCoverDragMainText } from "./wait-for-douyin-cover-drag-main-text.js";

export function findDouyinCoverUploadClickTarget(modal: ParentNode): HTMLElement | null {
	const dragArea = findDouyinCoverDragArea(modal);
	if (!dragArea) return findDouyinCoverDragMainText(modal);

	return findDouyinCoverDragMainText(dragArea) ?? dragArea;
}
