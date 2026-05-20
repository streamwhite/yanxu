import { BILIBILI_COVER_FILE_INPUT_SELECTORS } from "./bilibili-selectors.js";
import { findModalRoot } from "./find-modal-root.js";
import { pickFirstElement } from "./dom.js";

function findInputInScope(scope: ParentNode): HTMLInputElement | null {
	return pickFirstElement<HTMLInputElement>(scope, BILIBILI_COVER_FILE_INPUT_SELECTORS);
}

export function findCoverFileInputNearUploadArea(uploadArea: HTMLElement): HTMLInputElement | null {
	const inArea = findInputInScope(uploadArea);
	if (inArea) return inArea;

	const modalRoot = findModalRoot(uploadArea);
	return findInputInScope(modalRoot);
}
