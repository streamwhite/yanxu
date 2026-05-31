import {
	BILIBILI_COVER_EDIT_TEXT,
	BILIBILI_COVER_TRIGGER_SELECTORS,
} from "../../content/bilibili-selectors.js";
import { pickFirstElement } from "../../content/dom.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";

export function findBilibiliCoverTrigger(root: ParentNode): HTMLElement | null {
	for (const candidate of Array.from(root.querySelectorAll(".cover-img"))) {
		if (!(candidate instanceof HTMLElement)) continue;

		const editText = candidate.querySelector(".edit-text");
		if (normalizeUiText(editText?.textContent) === BILIBILI_COVER_EDIT_TEXT) {
			return candidate;
		}
	}

	return pickFirstElement(root, BILIBILI_COVER_TRIGGER_SELECTORS);
}
