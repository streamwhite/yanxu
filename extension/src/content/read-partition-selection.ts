import { BILIBILI_PARTITION_SELECT_ITEM_CLASS } from "./bilibili-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

export function readPartitionSelection(controller: HTMLElement): string | null {
	const item = controller.querySelector(`.${BILIBILI_PARTITION_SELECT_ITEM_CLASS}`);
	if (!item) return null;
	return normalizeUiText(item.textContent);
}
