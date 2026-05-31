import { waitMs } from "../../content/wait-ms.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import {
	CHANNELS_VIDEO_UPLOAD_SETTLE_AFTER_START_MS,
	CHANNELS_VIDEO_UPLOAD_SETTLE_WAIT_MS,
} from "../constants/platform-video-upload-timing.js";
import { channelsVideoAlreadyUploaded } from "./channels-video-already-uploaded.js";
import { channelsVideoUploadLooksStarted } from "./channels-video-upload-looks-started.js";

function channelsVideoUploadSettled(root: ParentNode): boolean {
	return channelsVideoUploadLooksStarted(root) || channelsVideoAlreadyUploaded(root);
}

export async function waitForChannelsVideoUploadSettled(root: ParentNode): Promise<boolean> {
	const deadline = Date.now() + CHANNELS_VIDEO_UPLOAD_SETTLE_WAIT_MS;

	while (Date.now() < deadline) {
		if (channelsVideoUploadSettled(root)) {
			await waitMs(CHANNELS_VIDEO_UPLOAD_SETTLE_AFTER_START_MS);
			return true;
		}
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return channelsVideoUploadSettled(root);
}
