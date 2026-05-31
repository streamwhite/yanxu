import { BILIBILI_PARTITION_SELECT_ITEM_CLASS } from "../../content/bilibili-selectors.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import { partitionLabelsMatch } from "./partition-label-matches.js";

export function listBilibiliPartitionDropdownOptions(
	root: ParentNode,
	controller: HTMLElement,
): HTMLElement[] {
	return queryAllDeep(root, `.${BILIBILI_PARTITION_SELECT_ITEM_CLASS}`).filter((element) => {
		if (!isElementVisible(element)) return false;
		if (controller.contains(element)) return false;
		return normalizeUiText(element.textContent).length > 0;
	});
}

export function isBilibiliPartitionDropdownOpen(
	root: ParentNode,
	controller: HTMLElement,
): boolean {
	return listBilibiliPartitionDropdownOptions(root, controller).length > 0;
}

export function findBilibiliPartitionDropdownOption(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): HTMLElement | null {
	const matches = listBilibiliPartitionDropdownOptions(root, controller).filter((element) =>
		partitionLabelsMatch(element.textContent ?? "", targetValue),
	);
	if (matches.length === 0) return null;

	const normalizedTarget = normalizeUiText(targetValue);
	const exact = matches.find(
		(element) => normalizeUiText(element.textContent) === normalizedTarget,
	);
	if (exact) return exact;

	return matches.sort(
		(left, right) =>
			normalizeUiText(right.textContent).length - normalizeUiText(left.textContent).length,
	)[0];
}
