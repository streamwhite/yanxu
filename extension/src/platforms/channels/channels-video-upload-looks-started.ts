import { queryAllDeep } from "../../content/query-all-deep.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import { channelsHasPostUploadMetadataUi } from "./channels-has-post-upload-metadata-ui.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";

const CHANNELS_ADD_ICON_SELECTOR = ".add-icon" as const;
const CHANNELS_UPLOAD_PROGRESS_HINTS = ["上传中", "转码", "处理中", "%"] as const;

function uploadAreaShowsProgress(uploadArea: HTMLElement): boolean {
	const text = uploadArea.textContent ?? "";
	return CHANNELS_UPLOAD_PROGRESS_HINTS.some((hint) => text.includes(hint));
}

function anyFileInputHasFiles(root: ParentNode): boolean {
	for (const candidate of queryAllDeep(root, 'input[type="file"]')) {
		if (candidate instanceof HTMLInputElement && inputHasAnyFile(candidate)) return true;
	}
	return false;
}

export function channelsVideoUploadLooksStarted(root: ParentNode): boolean {
	if (anyFileInputHasFiles(root)) return true;

	if (channelsHasPostUploadMetadataUi(root)) return true;

	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return false;

	if (uploadArea.querySelector("video") !== null) return true;
	if (uploadAreaShowsProgress(uploadArea)) return true;

	const addIcon = uploadArea.querySelector(CHANNELS_ADD_ICON_SELECTOR);
	return addIcon === null;
}
