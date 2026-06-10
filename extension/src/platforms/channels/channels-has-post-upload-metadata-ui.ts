import { queryAllDeep } from "../../content/query-all-deep.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import {
	CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
	CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
} from "./channels-cover-selectors.js";
import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";

const CHANNELS_UPLOAD_PREVIEW_MIN_PX = 40 as const;

function uploadAreaHasVideoPreview(uploadArea: HTMLElement): boolean {
	if (uploadArea.querySelector("video") !== null) return true;

	for (const candidate of Array.from(uploadArea.querySelectorAll("img"))) {
		if (!(candidate instanceof HTMLImageElement)) continue;
		if (candidate.classList.contains("blur-img")) continue;
		if (candidate.classList.contains("blur-img-bottom")) continue;
		const rect = candidate.getBoundingClientRect();
		if (
			rect.width >= CHANNELS_UPLOAD_PREVIEW_MIN_PX &&
			rect.height >= CHANNELS_UPLOAD_PREVIEW_MIN_PX
		) {
			return true;
		}
	}

	return false;
}

function anyVideoFileInputHasFiles(root: ParentNode): boolean {
	for (const candidate of queryAllDeep(root, 'input[type="file"]')) {
		if (candidate instanceof HTMLInputElement && inputHasAnyFile(candidate)) return true;
	}
	return false;
}

/** Cover fields render on the create page before a video is attached — need upload evidence too. */
function channelsVideoAttachedEvidence(root: ParentNode): boolean {
	if (anyVideoFileInputHasFiles(root)) return true;

	const uploadArea = findChannelsVideoUploadArea(root);
	if (uploadArea && uploadAreaHasVideoPreview(uploadArea)) return true;

	return uploadArea === null && channelsPostUploadFormReady(root);
}

export function channelsHasPostUploadMetadataUi(root: ParentNode): boolean {
	for (const selector of [
		CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
		CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
	]) {
		if (queryAllDeep(root, selector).length > 0) {
			return channelsVideoAttachedEvidence(root);
		}
	}

	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return false;
	return uploadAreaHasVideoPreview(uploadArea);
}
