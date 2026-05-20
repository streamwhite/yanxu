import { uploadAreaLooksLikeCoverModal } from "./upload-area-looks-like-cover-modal.js";
import { isElementVisible } from "./is-element-visible.js";

export function findCoverModalUploadArea(root: ParentNode): HTMLElement | null {
	const candidates = Array.from(root.querySelectorAll(".upload-area"));

	for (const candidate of candidates) {
		if (!(candidate instanceof HTMLElement)) continue;
		if (!isElementVisible(candidate)) continue;
		if (!uploadAreaLooksLikeCoverModal(candidate)) continue;
		return candidate;
	}

	return null;
}
