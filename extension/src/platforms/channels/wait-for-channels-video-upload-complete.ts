import { waitMs } from "../../content/wait-ms.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import { CHANNELS_VIDEO_UPLOAD_COMPLETE_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { channelsVideoReadyForCover } from "./channels-video-ready-for-cover.js";

export async function waitForChannelsVideoUploadComplete(
	root: ParentNode,
	waitMsLimit: number = CHANNELS_VIDEO_UPLOAD_COMPLETE_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (channelsVideoReadyForCover(root)) return true;
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return channelsVideoReadyForCover(root);
}
