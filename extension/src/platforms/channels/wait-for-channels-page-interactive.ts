import { waitMs } from "../../content/wait-ms.js";
import { FIELDS_READY_POLL_MS } from "../../content/constants/cover-modal-timing.js";
import { CHANNELS_PAGE_INTERACTIVE_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { channelsVideoAlreadyUploaded } from "./channels-video-already-uploaded.js";

export async function waitForChannelsPageInteractive(
	root: ParentNode,
	waitMsLimit: number = CHANNELS_PAGE_INTERACTIVE_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (findChannelsVideoUploadArea(root)) return true;
		if (channelsPostUploadFormReady(root)) return true;
		if (channelsVideoAlreadyUploaded(root)) return true;
		await waitMs(FIELDS_READY_POLL_MS);
	}

	return (
		findChannelsVideoUploadArea(root) !== null ||
		channelsPostUploadFormReady(root) ||
		channelsVideoAlreadyUploaded(root)
	);
}
