import { waitMs } from "../../content/wait-ms.js";
import { findChannelsCoverUploadDialog } from "./find-channels-cover-upload-dialog.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_POPOVER_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadDialogAbsent(
	root: ParentNode = document,
	waitMsLimit: number = CHANNELS_COVER_POPOVER_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (!findChannelsCoverUploadDialog(root)) return true;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return !findChannelsCoverUploadDialog(root);
}
