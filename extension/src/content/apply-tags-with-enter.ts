import { dispatchEnterKey } from "./dispatch-enter-key.js";
import { pickFirstVisibleElementDeep, setFormControlValue } from "./dom.js";
import { waitForTagInputCleared } from "./wait-for-tag-input-cleared.js";

export function tagsFieldMissingLabel(selectors: readonly string[], tagCount: number): string {
	return `${selectors.join(" | ")} (${String(tagCount)} tags, Enter each)`;
}

async function applyOneTag(input: HTMLInputElement, tag: string): Promise<void> {
	const trimmed = tag.trim();
	if (!trimmed) return;

	input.focus();
	setFormControlValue(input, trimmed);
	dispatchEnterKey(input);
	await waitForTagInputCleared(input);
}

export async function applyTagsWithEnter(
	root: ParentNode,
	selectors: readonly string[],
	tags: readonly string[],
): Promise<boolean> {
	const input = pickFirstVisibleElementDeep<HTMLInputElement>(root, selectors);
	if (!input) return false;

	for (const tag of tags) {
		await applyOneTag(input, tag);
	}

	return true;
}
