import { findModalRoot } from "./find-modal-root.js";
import { isVideoFileInput } from "./is-video-file-input.js";
import { queryAllDeep } from "./query-all-deep.js";

function collectVideoFileInputs(scope: ParentNode): HTMLInputElement[] {
	return queryAllDeep(scope, 'input[type="file"]').filter(
		(element): element is HTMLInputElement =>
			element instanceof HTMLInputElement && isVideoFileInput(element),
	);
}

function pickClosestToUploadArea(
	uploadArea: HTMLElement,
	inputs: readonly HTMLInputElement[],
): HTMLInputElement | null {
	for (const input of inputs) {
		if (uploadArea.contains(input)) return input;
	}

	const modalRoot = findModalRoot(uploadArea);
	for (const input of inputs) {
		if (modalRoot.contains(input)) return input;
	}

	return inputs[0] ?? null;
}

export function findVideoFileInputNearUploadArea(uploadArea: HTMLElement): HTMLInputElement | null {
	const inArea = collectVideoFileInputs(uploadArea);
	const fromArea = pickClosestToUploadArea(uploadArea, inArea);
	if (fromArea) return fromArea;

	const modalRoot = findModalRoot(uploadArea);
	const inModal = collectVideoFileInputs(modalRoot);
	return pickClosestToUploadArea(uploadArea, inModal);
}
