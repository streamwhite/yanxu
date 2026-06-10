import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";
import { channelsVideoUploadInProgress } from "./channels-video-upload-in-progress.js";
import { channelsVideoUploadVerified } from "./channels-video-upload-verified.js";

/** True when the metadata form can be edited and cover upload should be attempted. */
export function channelsVideoReadyForCover(root: ParentNode, file?: File): boolean {
	if (channelsVideoUploadInProgress(root)) return false;
	if (channelsVideoUploadVerified(root, file)) return true;
	return channelsPostUploadFormReady(root);
}
