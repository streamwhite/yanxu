import { isVideoFileInput } from "../../content/is-video-file-input.js";

const CHANNELS_UPLOAD_CONTENT_SELECTOR = ".upload-content" as const;

export function isChannelsVideoFileInput(input: HTMLInputElement, root: ParentNode): boolean {
	if (!isVideoFileInput(input)) return false;

	if (input.closest(CHANNELS_UPLOAD_CONTENT_SELECTOR)) return true;

	const hasUploadSection =
		root instanceof Document
			? root.querySelector(CHANNELS_UPLOAD_CONTENT_SELECTOR) !== null
			: false;

	return hasUploadSection;
}
