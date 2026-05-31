import { queryAllDeep } from "../../content/query-all-deep.js";
import { DOUYIN_COVER_MODAL_BODY_SELECTOR } from "./douyin-cover-selectors.js";

export function findDouyinCoverModalBody(root: ParentNode): HTMLElement | null {
	if (root instanceof HTMLElement && root.matches(DOUYIN_COVER_MODAL_BODY_SELECTOR)) {
		return root;
	}

	if (root instanceof Document) {
		const direct = root.querySelector(DOUYIN_COVER_MODAL_BODY_SELECTOR);
		if (direct instanceof HTMLElement) return direct;
	}

	for (const candidate of queryAllDeep(root, DOUYIN_COVER_MODAL_BODY_SELECTOR)) {
		if (candidate instanceof HTMLElement && candidate.isConnected) return candidate;
	}

	return null;
}
