import { BILIBILI_PARTITION_SELECT_ITEM_CLASS } from "./bilibili-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

export function pickPartitionOption(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): HTMLElement | null {
	const normalizedTarget = normalizeUiText(targetValue);
	const matches: HTMLElement[] = [];

	for (const element of Array.from(
		root.querySelectorAll(`.${BILIBILI_PARTITION_SELECT_ITEM_CLASS}`),
	)) {
		if (!(element instanceof HTMLElement)) continue;
		if (normalizeUiText(element.textContent) !== normalizedTarget) continue;
		matches.push(element);
	}

	const outsideController = matches.filter((element) => !controller.contains(element));
	if (outsideController.length > 0) return outsideController[0] ?? null;

	return matches[0] ?? null;
}
