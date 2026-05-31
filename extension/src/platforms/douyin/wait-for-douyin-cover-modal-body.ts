import { waitMs } from "../../content/wait-ms.js";
import { findDouyinCoverModalBody } from "./find-douyin-cover-modal-body.js";
import {
	DOUYIN_COVER_MODAL_WAIT_MS,
	DOUYIN_COVER_POLL_MS,
} from "./constants/douyin-cover-timing.js";

export async function waitForDouyinCoverModalBody(root: ParentNode): Promise<HTMLElement | null> {
	const deadline = Date.now() + DOUYIN_COVER_MODAL_WAIT_MS;

	while (Date.now() < deadline) {
		const modal = findDouyinCoverModalBody(root);
		if (modal) return modal;
		await waitMs(DOUYIN_COVER_POLL_MS);
	}

	return null;
}
