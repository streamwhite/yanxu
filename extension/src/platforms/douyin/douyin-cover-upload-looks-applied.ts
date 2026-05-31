import { pickFirstVisibleElementDeep } from "../../content/dom.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import { isImageFileInput } from "../../content/is-image-file-input.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	DOUYIN_COVER_MODAL_PREVIEW_SELECTORS,
	DOUYIN_COVER_MODAL_UPLOAD_LIST_SELECTORS,
} from "./douyin-cover-selectors.js";
import { findDouyinCoverModalBody } from "./find-douyin-cover-modal-body.js";
import { findDouyinCoverDragMainText } from "./wait-for-douyin-cover-drag-main-text.js";

const DOUYIN_COVER_PREVIEW_MIN_PX = 40 as const;

function modalScope(root: ParentNode): ParentNode {
	return findDouyinCoverModalBody(root) ?? root;
}

function modalHasAssignedImageInput(scope: ParentNode): boolean {
	for (const candidate of queryAllDeep(scope, 'input[type="file"]')) {
		if (!(candidate instanceof HTMLInputElement)) continue;
		if (!isImageFileInput(candidate)) continue;
		if (inputHasAnyFile(candidate)) return true;
	}
	return false;
}

function hasVisibleUploadPreview(scope: ParentNode): boolean {
	for (const img of queryAllDeep(scope, "img")) {
		if (!(img instanceof HTMLImageElement)) continue;
		if (img.closest(".semi-upload-drag-area-icon")) continue;
		const rect = img.getBoundingClientRect();
		if (rect.width >= DOUYIN_COVER_PREVIEW_MIN_PX && rect.height >= DOUYIN_COVER_PREVIEW_MIN_PX) {
			return true;
		}
	}
	return false;
}

export function douyinCoverUploadLooksApplied(root: ParentNode): boolean {
	const scope = modalScope(root);

	if (modalHasAssignedImageInput(scope)) return true;

	if (pickFirstVisibleElementDeep(scope, DOUYIN_COVER_MODAL_UPLOAD_LIST_SELECTORS)) {
		return true;
	}

	if (pickFirstVisibleElementDeep(scope, DOUYIN_COVER_MODAL_PREVIEW_SELECTORS)) {
		return true;
	}

	if (hasVisibleUploadPreview(scope)) return true;

	return !findDouyinCoverDragMainText(scope) && hasVisibleUploadPreview(scope);
}
