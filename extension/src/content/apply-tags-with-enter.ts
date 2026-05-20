import { dispatchEnterKey } from "./dispatch-enter-key.js";
import { pickFirstElement, setFormControlValue } from "./dom.js";

export function tagsFieldMissingLabel(selectors: readonly string[], tagCount: number): string {
	return `${selectors.join(" | ")} (${String(tagCount)} tags, Enter each)`;
}

export function applyTagsWithEnter(
	root: ParentNode,
	selectors: readonly string[],
	tags: readonly string[],
): boolean {
	const input = pickFirstElement<HTMLInputElement>(root, selectors);
	if (!input) return false;

	for (const tag of tags) {
		const trimmed = tag.trim();
		if (!trimmed) continue;

		input.focus();
		setFormControlValue(input, trimmed);
		dispatchEnterKey(input);
	}

	return true;
}
