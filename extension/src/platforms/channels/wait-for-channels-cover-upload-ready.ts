import { waitMs } from "../../content/wait-ms.js";
import {
	channelsCoverDialogLooksApplied,
	channelsCoverWrapLooksUserUploaded,
} from "./channels-cover-upload-looks-applied.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadReady(
	root: ParentNode,
	dialog: ParentNode,
	wrapSelector: string,
	waitMsLimit: number = CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (channelsCoverWrapLooksUserUploaded(root, wrapSelector)) return true;
		if (channelsCoverDialogLooksApplied(dialog)) return true;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return (
		channelsCoverWrapLooksUserUploaded(root, wrapSelector) ||
		channelsCoverDialogLooksApplied(dialog)
	);
}
