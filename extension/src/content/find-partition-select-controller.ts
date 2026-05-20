import { BILIBILI_PARTITION_SECTION_TITLE } from "@auto-upload/domain";
import {
	BILIBILI_PARTITION_SECTION_HEADING_CLASS,
	BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS,
} from "./bilibili-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

export function findPartitionSelectController(root: ParentNode): HTMLElement | null {
	const headings = Array.from(
		root.querySelectorAll(`h3.${BILIBILI_PARTITION_SECTION_HEADING_CLASS}`),
	);

	for (const heading of headings) {
		if (!(heading instanceof HTMLElement)) continue;
		if (normalizeUiText(heading.textContent) !== BILIBILI_PARTITION_SECTION_TITLE) continue;

		let ancestor: HTMLElement | null = heading;
		while (ancestor) {
			const controller = ancestor.querySelector(`.${BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS}`);
			if (controller instanceof HTMLElement) return controller;
			ancestor = ancestor.parentElement;
		}
	}

	return null;
}
