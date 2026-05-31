import { waitMs } from "../../content/wait-ms.js";
import { findChannelsCoverUploadClickTarget } from "./find-channels-cover-upload-click-target.js";
import {
	CHANNELS_COVER_FILE_INPUT_WAIT_MS,
	CHANNELS_COVER_POLL_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadClickTarget(
	scope: ParentNode,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + CHANNELS_COVER_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const target = findChannelsCoverUploadClickTarget(scope);
		if (target) return target;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return null;
}
