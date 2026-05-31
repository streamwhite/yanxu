import { channelsHasPostUploadMetadataUi } from "./channels-has-post-upload-metadata-ui.js";
import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { channelsVideoUploadLooksStarted } from "./channels-video-upload-looks-started.js";

/** True when the creator form is past the empty upload picker (video attached or metadata form visible). */
export function channelsVideoAlreadyUploaded(root: ParentNode): boolean {
	if (channelsVideoUploadLooksStarted(root)) return true;

	if (channelsHasPostUploadMetadataUi(root)) return true;

	return channelsPostUploadFormReady(root) && !findChannelsVideoUploadArea(root);
}
