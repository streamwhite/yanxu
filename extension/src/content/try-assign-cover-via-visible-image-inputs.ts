import { assignFileViaDragDrop } from "./assign-file-via-drag-drop.js";
import { collectVisibleImageFileInputs } from "./collect-visible-image-file-inputs.js";
import { inputHasAssignedFile } from "./input-has-assigned-file.js";
import { assignFileToInput } from "./dom.js";

function tryAssignToInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

export function tryAssignCoverViaVisibleImageInputs(root: ParentNode, file: File): boolean {
	const inputs = collectVisibleImageFileInputs(root);
	for (const input of inputs) {
		if (tryAssignToInput(input, file)) return true;
	}

	const first = inputs[0];
	if (first?.parentElement instanceof HTMLElement) {
		assignFileViaDragDrop(first.parentElement, file);
		if (tryAssignToInput(first, file)) return true;
	}

	return false;
}
