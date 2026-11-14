import { BILIBILI_PARTITION_SECTION_TITLE } from "@yanxu/domain";
import {
	BILIBILI_PARTITION_SECTION_HEADING_CLASS,
	BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS,
	BILIBILI_PARTITION_SELECTOR_CONTAINER_CLASS,
} from "../../content/bilibili-selectors.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function findSelectControllerNearHeading(heading: HTMLElement): HTMLElement | null {
	let ancestor: HTMLElement | null = heading;
	while (ancestor) {
		for (const selector of [
			`.${BILIBILI_PARTITION_SELECTOR_CONTAINER_CLASS}`,
			`.${BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS}`,
		]) {
			for (const candidate of queryAllDeep(ancestor, selector)) {
				if (!(candidate instanceof HTMLElement)) continue;
				if (!isElementVisible(candidate)) continue;
				return candidate;
			}
		}
		ancestor = ancestor.parentElement;
	}
	return null;
}

function isPartitionSectionHeading(element: HTMLElement): boolean {
	if (!isElementVisible(element)) return false;
	return normalizeUiText(element.textContent) === BILIBILI_PARTITION_SECTION_TITLE;
}

export function findBilibiliPartitionSelectController(root: ParentNode): HTMLElement | null {
	const primaryHeadings = queryAllDeep(root, `h3.${BILIBILI_PARTITION_SECTION_HEADING_CLASS}`);
	for (const heading of primaryHeadings) {
		if (!(heading instanceof HTMLElement)) continue;
		if (!isPartitionSectionHeading(heading)) continue;
		const controller = findSelectControllerNearHeading(heading);
		if (controller) return controller;
	}

	for (const heading of queryAllDeep(root, "h3, h4")) {
		if (!(heading instanceof HTMLElement)) continue;
		if (!isPartitionSectionHeading(heading)) continue;
		const controller = findSelectControllerNearHeading(heading);
		if (controller) return controller;
	}

	return null;
}
