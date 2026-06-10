import { waitMs } from "../../content/wait-ms.js";
import { channelsCoverWrapLooksUserUploaded } from "./channels-cover-upload-looks-applied.js";
import { CHANNELS_VERTICAL_COVER_WRAP_SELECTOR } from "./channels-cover-selectors.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadApplied(
	root: ParentNode,
	waitMsLimit: number = CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
	wrapSelector: string = CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (channelsCoverWrapLooksUserUploaded(root, wrapSelector)) return true;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return channelsCoverWrapLooksUserUploaded(root, wrapSelector);
}
