import { queryAllDeep } from "../../content/query-all-deep.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { channelsVideoUploadInProgress } from "./channels-video-upload-in-progress.js";

function anyVideoFileInputHasFiles(root: ParentNode, file?: File): boolean {
	for (const candidate of queryAllDeep(root, 'input[type="file"]')) {
		if (!(candidate instanceof HTMLInputElement)) continue;
		if (file && inputHasAssignedFile(candidate, file)) return true;
		if (inputHasAnyFile(candidate)) return true;
	}
	return false;
}

/** Video file is on the page (assigned or preview visible), possibly still uploading to WeChat servers. */
export function channelsVideoAttached(root: ParentNode, file?: File): boolean {
	if (anyVideoFileInputHasFiles(root, file)) return true;

	const uploadArea = findChannelsVideoUploadArea(root);
	if (uploadArea?.querySelector("video") !== null) return true;

	return findChannelsVideoUploadArea(root) === null && channelsPostUploadFormReady(root);
}

/** True when cover editing is allowed — attached and server upload/processing finished. */
export function channelsVideoUploadVerified(root: ParentNode, file?: File): boolean {
	if (channelsVideoUploadInProgress(root)) return false;
	return channelsVideoAttached(root, file);
}

/** @deprecated Use channelsVideoAttached; kept for call sites that mean “assign started”. */
export function channelsVideoUploadLooksAttached(root: ParentNode, file?: File): boolean {
	return channelsVideoAttached(root, file) || channelsVideoUploadInProgress(root);
}
