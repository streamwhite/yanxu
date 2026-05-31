import {
	BILIBILI_SOURCE_TYPE_LABEL_CLASS,
	BILIBILI_SOURCE_TYPE_OPTION_CLASS,
} from "./bilibili-selectors.js";
import { pickFirstVisibleElementDeep } from "./dom.js";

export function clickRadioOptionByLabel(
	root: ParentNode,
	groupSelectors: readonly string[],
	label: string,
): boolean {
	const group = pickFirstVisibleElementDeep<HTMLElement>(root, groupSelectors);
	if (!group) return false;

	const containers = Array.from(group.querySelectorAll(`.${BILIBILI_SOURCE_TYPE_OPTION_CLASS}`));
	for (const container of containers) {
		if (!(container instanceof HTMLElement)) continue;

		const nameEl = container.querySelector(`.${BILIBILI_SOURCE_TYPE_LABEL_CLASS}`);
		if (nameEl?.textContent?.trim() !== label) continue;

		container.click();
		return true;
	}

	return false;
}
