import { waitMs } from "../../content/wait-ms.js";
import { findChannelsVerticalCoverConfirmButton } from "./find-channels-vertical-cover-confirm-button.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_FILE_INPUT_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsVerticalCoverConfirmButton(
	root: ParentNode = document,
	waitMsLimit: number = CHANNELS_COVER_FILE_INPUT_WAIT_MS,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		const button = findChannelsVerticalCoverConfirmButton(root);
		if (button) return button;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return findChannelsVerticalCoverConfirmButton(root);
}
