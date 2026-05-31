import { collectVideoFileInputs } from "./collect-video-file-inputs.js";

export function findVideoFileInput(
	root: ParentNode,
	selectors: readonly string[],
): HTMLInputElement | null {
	return collectVideoFileInputs(root, selectors)[0] ?? null;
}
