import {
	BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS,
	BILIBILI_PARTITION_SELECT_ITEM_CLASS,
	BILIBILI_PARTITION_SELECT_ITEM_INSERTED_CLASS,
	BILIBILI_PARTITION_SELECTOR_CONTAINER_CLASS,
} from "../../content/bilibili-selectors.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

function findDisplayInContainer(container: HTMLElement): HTMLElement | null {
	const inserted = container.querySelector(`.${BILIBILI_PARTITION_SELECT_ITEM_INSERTED_CLASS}`);
	if (inserted instanceof HTMLElement) return inserted;

	const item = container.querySelector(`.${BILIBILI_PARTITION_SELECT_ITEM_CLASS}`);
	if (item instanceof HTMLElement) return item;

	return null;
}

export function findBilibiliPartitionDisplayElement(container: HTMLElement): HTMLElement | null {
	const direct = findDisplayInContainer(container);
	if (direct) return direct;

	if (container.classList.contains(BILIBILI_PARTITION_SELECTOR_CONTAINER_CLASS)) {
		for (const controller of queryAllDeep(
			container,
			`.${BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS}`,
		)) {
			const display = findDisplayInContainer(controller);
			if (display) return display;
		}
	}

	return null;
}
