import { queryAllDeep } from "../../content/query-all-deep.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import {
	DOUYIN_COVER_DRAG_MAIN_TEXT,
	DOUYIN_COVER_SEMI_DRAG_MAIN_TEXT_SELECTOR,
} from "./douyin-cover-selectors.js";
import { waitMs } from "../../content/wait-ms.js";
import {
	DOUYIN_COVER_MODAL_WAIT_MS,
	DOUYIN_COVER_POLL_MS,
} from "./constants/douyin-cover-timing.js";

function matchesDouyinCoverDragMainText(element: HTMLElement): boolean {
	const text = normalizeUiText(element.textContent);
	if (text.includes(DOUYIN_COVER_DRAG_MAIN_TEXT)) return true;
	return text.includes("点击上传文件") && text.includes("拖拽");
}

export function findDouyinCoverDragMainText(root: ParentNode): HTMLElement | null {
	for (const candidate of queryAllDeep(root, DOUYIN_COVER_SEMI_DRAG_MAIN_TEXT_SELECTOR)) {
		if (!(candidate instanceof HTMLElement)) continue;
		if (!candidate.isConnected) continue;
		if (!matchesDouyinCoverDragMainText(candidate)) continue;
		return candidate;
	}
	return null;
}

export async function waitForDouyinCoverDragMainText(
	root: ParentNode,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + DOUYIN_COVER_MODAL_WAIT_MS;

	while (Date.now() < deadline) {
		const found = findDouyinCoverDragMainText(root);
		if (found) return found;
		await waitMs(DOUYIN_COVER_POLL_MS);
	}

	return null;
}
