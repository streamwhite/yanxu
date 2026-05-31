import { waitMs } from "../../content/wait-ms.js";
import { findChannelsCoverUploadDialog } from "./find-channels-cover-upload-dialog.js";
import {
	CHANNELS_COVER_POPOVER_WAIT_MS,
	CHANNELS_COVER_POLL_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadDialog(
	root: ParentNode,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + CHANNELS_COVER_POPOVER_WAIT_MS;

	while (Date.now() < deadline) {
		const dialog = findChannelsCoverUploadDialog(root);
		if (dialog) return dialog;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return null;
}
