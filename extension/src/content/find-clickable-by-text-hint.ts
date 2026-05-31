import { queryAllDeep } from "./query-all-deep.js";

const CLICKABLE_SELECTOR = "button, label, [role='button']" as const;

function elementMatchesHint(element: HTMLElement, hint: string): boolean {
	const text = element.textContent?.trim() ?? "";
	return text.includes(hint);
}

export function findClickableByTextHint(root: ParentNode, hint: string): HTMLElement | null {
	for (const element of queryAllDeep(root, CLICKABLE_SELECTOR)) {
		if (!elementMatchesHint(element, hint)) continue;
		return element;
	}
	return null;
}
