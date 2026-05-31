import { waitMs } from "../../content/wait-ms.js";
import { findDouyinCoverFileInput } from "./find-douyin-cover-file-input.js";
import {
	DOUYIN_COVER_FILE_INPUT_WAIT_MS,
	DOUYIN_COVER_POLL_MS,
} from "./constants/douyin-cover-timing.js";

export async function waitForDouyinCoverFileInput(
	root: ParentNode,
	near?: HTMLElement | null,
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + DOUYIN_COVER_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findDouyinCoverFileInput(root, near);
		if (input) return input;
		await waitMs(DOUYIN_COVER_POLL_MS);
	}

	return null;
}
