import { waitMs } from "../../content/wait-ms.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import { CHANNELS_VIDEO_UPLOAD_SETTLE_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { channelsVideoUploadVerified } from "./channels-video-upload-verified.js";

export async function waitForChannelsVideoUploadSettled(root: ParentNode): Promise<boolean> {
	const deadline = Date.now() + CHANNELS_VIDEO_UPLOAD_SETTLE_WAIT_MS;

	while (Date.now() < deadline) {
		if (channelsVideoUploadVerified(root)) return true;
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return channelsVideoUploadVerified(root);
}
