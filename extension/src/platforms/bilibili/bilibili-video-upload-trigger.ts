import { dispatchClick } from "../../content/dispatch-click.js";
import { findBilibiliVideoUploadArea } from "./find-bilibili-video-upload-area.js";

const BILIBILI_UPLOAD_TEXT_SELECTOR = ".upload-text" as const;

function clickFirstDescendant(uploadArea: HTMLElement, selector: string): boolean {
	const target = uploadArea.querySelector(selector);
	if (!(target instanceof HTMLElement)) return false;
	dispatchClick(target);
	return true;
}

export function clickBilibiliVideoUploadTrigger(root: ParentNode): HTMLElement | null {
	const uploadArea = findBilibiliVideoUploadArea(root);
	if (!uploadArea) return null;

	if (clickFirstDescendant(uploadArea, BILIBILI_UPLOAD_TEXT_SELECTOR)) return uploadArea;

	dispatchClick(uploadArea);
	return uploadArea;
}
