import { BILIBILI_PARTITION_SELECT_ITEM_ROW_CLASS } from "../../content/bilibili-selectors.js";

export function resolveBilibiliPartitionClickTarget(element: HTMLElement): HTMLElement {
	let current: HTMLElement | null = element;
	while (current) {
		if (current.classList.contains(BILIBILI_PARTITION_SELECT_ITEM_ROW_CLASS)) return current;
		current = current.parentElement;
	}
	return element;
}
