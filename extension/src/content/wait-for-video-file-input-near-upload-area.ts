import {
	VIDEO_FILE_INPUT_POLL_MS,
	VIDEO_FILE_INPUT_WAIT_MS,
} from "./constants/video-upload-timing.js";
import { findVideoFileInputNearUploadArea } from "./find-video-file-input-near-upload-area.js";
import { waitMs } from "./wait-ms.js";

export async function waitForVideoFileInputNearUploadArea(
	uploadArea: HTMLElement,
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + VIDEO_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findVideoFileInputNearUploadArea(uploadArea);
		if (input) return input;

		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return null;
}
