import { waitMs } from "../../content/wait-ms.js";
import { channelsCoverUploadLooksApplied } from "./channels-cover-upload-looks-applied.js";
import {
	CHANNELS_COVER_POLL_MS,
	CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/channels-cover-timing.js";

export async function waitForChannelsCoverUploadApplied(
	root: ParentNode,
	waitMsLimit: number = CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
): Promise<boolean> {
	const deadline = Date.now() + waitMsLimit;

	while (Date.now() < deadline) {
		if (channelsCoverUploadLooksApplied(root)) return true;
		await waitMs(CHANNELS_COVER_POLL_MS);
	}

	return channelsCoverUploadLooksApplied(root);
}
