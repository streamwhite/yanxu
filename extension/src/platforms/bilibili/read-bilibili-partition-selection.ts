import {
	BILIBILI_PARTITION_SELECT_ITEM_CLASS,
	BILIBILI_PARTITION_SELECT_ITEM_INSERTED_CLASS,
} from "../../content/bilibili-selectors.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";

export function readBilibiliPartitionSelection(controller: HTMLElement): string | null {
	const inserted = controller.querySelector(`.${BILIBILI_PARTITION_SELECT_ITEM_INSERTED_CLASS}`);
	if (inserted) return normalizeUiText(inserted.textContent);

	const item = controller.querySelector(`.${BILIBILI_PARTITION_SELECT_ITEM_CLASS}`);
	if (!item) return null;
	return normalizeUiText(item.textContent);
}
