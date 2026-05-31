import { waitMs } from "../../content/wait-ms.js";
import { findDouyinCoverUploadClickTarget } from "./find-douyin-cover-upload-click-target.js";
import {
	DOUYIN_COVER_MODAL_WAIT_MS,
	DOUYIN_COVER_POLL_MS,
} from "./constants/douyin-cover-timing.js";

export async function waitForDouyinCoverUploadClickTarget(
	modal: ParentNode,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + DOUYIN_COVER_MODAL_WAIT_MS;

	while (Date.now() < deadline) {
		const target = findDouyinCoverUploadClickTarget(modal);
		if (target) return target;
		await waitMs(DOUYIN_COVER_POLL_MS);
	}

	return null;
}
