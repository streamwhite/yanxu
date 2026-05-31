import { queryAllDeep } from "./query-all-deep.js";

function labelMatchesHint(label: HTMLElement, hint: string): boolean {
	return label.textContent?.includes(hint) ?? false;
}

export function findCheckboxLabelByTextHint(
	root: ParentNode,
	selector: string,
	hint: string,
): HTMLElement | null {
	for (const label of queryAllDeep(root, selector)) {
		if (!labelMatchesHint(label, hint)) continue;
		return label;
	}
	return null;
}
