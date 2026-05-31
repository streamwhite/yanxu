import { findModalRoot } from "./find-modal-root.js";
import { isImageFileInput } from "./is-image-file-input.js";

function collectImageFileInputs(scope: ParentNode): HTMLInputElement[] {
	return Array.from(scope.querySelectorAll('input[type="file"]')).filter(
		(element): element is HTMLInputElement =>
			element instanceof HTMLInputElement && isImageFileInput(element),
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

	return inputs.at(-1) ?? null;
}

export function findCoverFileInputNearUploadArea(uploadArea: HTMLElement): HTMLInputElement | null {
	const inArea = collectImageFileInputs(uploadArea);
	const fromArea = pickClosestToUploadArea(uploadArea, inArea);
	if (fromArea) return fromArea;

	const modalRoot = findModalRoot(uploadArea);
	const inModal = collectImageFileInputs(modalRoot);
	const fromModal = pickClosestToUploadArea(uploadArea, inModal);
	if (fromModal) return fromModal;

	const onPage = collectImageFileInputs(document);
	return pickClosestToUploadArea(uploadArea, onPage);
}
