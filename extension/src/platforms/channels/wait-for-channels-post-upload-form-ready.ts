import { waitMs } from "../../content/wait-ms.js";
import { FIELDS_READY_POLL_MS } from "../../content/constants/cover-modal-timing.js";
import { CHANNELS_FIELDS_READY_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { channelsPostUploadFormReady } from "./channels-post-upload-form-ready.js";

export async function waitForChannelsPostUploadFormReady(
	root: ParentNode,
	waitMsLimit: number = CHANNELS_FIELDS_READY_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (channelsPostUploadFormReady(root)) return true;
		await waitMs(FIELDS_READY_POLL_MS);
	}

	return channelsPostUploadFormReady(root);
}
