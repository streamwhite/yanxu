import { CHANNELS_VIDEO_FILE_INPUT_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import { waitMs } from "../../content/wait-ms.js";
import { findChannelsVideoFileInput } from "./find-channels-video-file-input.js";

export async function waitForChannelsVideoFileInput(
	root: ParentNode,
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + CHANNELS_VIDEO_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findChannelsVideoFileInput(root);
		if (input) return input;

		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return null;
}
