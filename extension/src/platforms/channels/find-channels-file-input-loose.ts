import { queryAllDeep } from "../../content/query-all-deep.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";

const FILE_INPUT_SELECTOR = 'input[type="file"]' as const;

function firstFileInputInScope(scope: ParentNode): HTMLInputElement | null {
	for (const candidate of queryAllDeep(scope, FILE_INPUT_SELECTOR)) {
		if (candidate instanceof HTMLInputElement) return candidate;
	}
	return null;
}

export function findChannelsFileInputLoose(root: ParentNode): HTMLInputElement | null {
	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return null;

	const inArea = firstFileInputInScope(uploadArea);
	if (inArea) return inArea;

	const parent = uploadArea.parentElement;
	if (parent) {
		const sibling = firstFileInputInScope(parent);
		if (sibling) return sibling;
	}

	return firstFileInputInScope(root);
}
