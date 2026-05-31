import { queryAllDeep } from "./query-all-deep.js";
import { isElementVisible } from "./is-element-visible.js";
import { isImageFileInput } from "./is-image-file-input.js";

export function collectVisibleImageFileInputs(root: ParentNode): HTMLInputElement[] {
	const matches: HTMLInputElement[] = [];

	for (const input of queryAllDeep(root, 'input[type="file"]')) {
		if (!(input instanceof HTMLInputElement)) continue;
		if (!isElementVisible(input)) continue;
		if (!isImageFileInput(input)) continue;
		matches.push(input);
	}

	return matches;
}
