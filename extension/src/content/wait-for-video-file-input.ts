import {
	VIDEO_FILE_INPUT_POLL_MS,
	VIDEO_FILE_INPUT_WAIT_MS,
} from "./constants/video-upload-timing.js";
import { findVideoFileInput } from "./find-video-file-input.js";
import { waitMs } from "./wait-ms.js";

export async function waitForVideoFileInput(
	root: ParentNode,
	selectors: readonly string[],
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + VIDEO_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findVideoFileInput(root, selectors);
		if (input) return input;

		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return null;
}
