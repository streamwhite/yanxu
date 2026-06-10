import { waitMs } from "../../content/wait-ms.js";
import { findChannelsUseMaterialButton } from "./find-channels-use-material-button.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_POPOVER_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsUseMaterialButton(
	root: ParentNode = document,
	waitMsLimit: number = CHANNELS_COVER_POPOVER_WAIT_MS,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		const button = findChannelsUseMaterialButton(root);
		if (button) return button;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return findChannelsUseMaterialButton(root);
}
