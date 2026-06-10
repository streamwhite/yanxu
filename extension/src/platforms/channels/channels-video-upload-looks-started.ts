import { channelsVideoAttached } from "./channels-video-upload-verified.js";
import { channelsVideoUploadInProgress } from "./channels-video-upload-in-progress.js";

/** Video assign or server upload has started — do not assign again. */
export function channelsVideoUploadLooksStarted(root: ParentNode): boolean {
	return channelsVideoAttached(root) || channelsVideoUploadInProgress(root);
}
