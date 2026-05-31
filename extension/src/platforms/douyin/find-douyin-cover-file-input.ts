import { queryAllDeep } from "../../content/query-all-deep.js";
import { isImageFileInput } from "../../content/is-image-file-input.js";
import {
	DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR,
	DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR,
} from "./douyin-cover-selectors.js";
import { findDouyinCoverModalBody } from "./find-douyin-cover-modal-body.js";

function collectImageInputs(scope: ParentNode): HTMLInputElement[] {
	return queryAllDeep(scope, 'input[type="file"]').filter(
		(element): element is HTMLInputElement =>
			element instanceof HTMLInputElement && isImageFileInput(element),
	);
}

function resolveSemiUploadRoot(near: HTMLElement): HTMLElement {
	const fromDrag = near.closest(DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR);
	if (fromDrag instanceof HTMLElement) {
		const semi = fromDrag.closest(DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR);
		if (semi instanceof HTMLElement) return semi;
		return fromDrag;
	}

	const semi = near.closest(DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR);
	if (semi instanceof HTMLElement) return semi;

	return near;
}

function findInputNearClickTarget(clickTarget: HTMLElement): HTMLInputElement | null {
	const scope = resolveSemiUploadRoot(clickTarget);
	const inScope = collectImageInputs(scope);
	return inScope[0] ?? null;
}

export function findDouyinCoverFileInput(
	root: ParentNode,
	near?: HTMLElement | null,
): HTMLInputElement | null {
	if (near) {
		const scoped = findInputNearClickTarget(near);
		if (scoped) return scoped;
	}

	const modal = findDouyinCoverModalBody(root);
	if (modal) {
		const inModal = collectImageInputs(modal);
		if (inModal.length > 0) return inModal[0] ?? null;
	}

	return null;
}
