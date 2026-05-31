import { waitMs } from "../../content/wait-ms.js";
import { douyinCoverUploadLooksApplied } from "./douyin-cover-upload-looks-applied.js";
import {
	DOUYIN_COVER_POLL_MS,
	DOUYIN_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/douyin-cover-timing.js";

export async function waitForDouyinCoverUploadApplied(root: ParentNode): Promise<boolean> {
	const deadline = Date.now() + DOUYIN_COVER_UPLOAD_APPLIED_WAIT_MS;

	while (Date.now() < deadline) {
		if (douyinCoverUploadLooksApplied(root)) return true;
		await waitMs(DOUYIN_COVER_POLL_MS);
	}

	return douyinCoverUploadLooksApplied(root);
}
