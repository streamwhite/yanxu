import { waitMs } from "../../content/wait-ms.js";
import { findChannelsCoverFileInput } from "./find-channels-cover-file-input.js";
import {
	CHANNELS_COVER_FILE_INPUT_WAIT_MS,
	CHANNELS_COVER_POLL_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverFileInput(
	scope: ParentNode,
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + CHANNELS_COVER_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findChannelsCoverFileInput(scope);
		if (input) return input;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return null;
}
