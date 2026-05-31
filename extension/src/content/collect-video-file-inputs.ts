import { isVideoFileInput } from "./is-video-file-input.js";
import { queryAllDeep } from "./query-all-deep.js";

function isUsableVideoInput(candidate: Element): candidate is HTMLInputElement {
	return (
		candidate instanceof HTMLInputElement &&
		candidate.type === "file" &&
		isVideoFileInput(candidate)
	);
}

export function collectVideoFileInputs(
	root: ParentNode,
	selectors: readonly string[],
): HTMLInputElement[] {
	const inputs: HTMLInputElement[] = [];

	for (const selector of selectors) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!isUsableVideoInput(candidate)) continue;
			inputs.push(candidate);
		}
	}

	return inputs;
}
