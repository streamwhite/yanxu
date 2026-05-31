import { dispatchClick } from "../../content/dispatch-click.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";

const CHANNELS_ADD_ICON_SELECTOR = ".add-icon" as const;
const CHANNELS_CENTER_SELECTOR = ".center" as const;

function clickFirstDescendant(uploadArea: HTMLElement, selector: string): boolean {
	const target = uploadArea.querySelector(selector);
	if (!(target instanceof HTMLElement)) return false;
	dispatchClick(target);
	return true;
}

export function clickChannelsVideoUploadTrigger(root: ParentNode): HTMLElement | null {
	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return null;

	if (clickFirstDescendant(uploadArea, CHANNELS_ADD_ICON_SELECTOR)) return uploadArea;
	if (clickFirstDescendant(uploadArea, CHANNELS_CENTER_SELECTOR)) return uploadArea;

	dispatchClick(uploadArea);
	return uploadArea;
}
