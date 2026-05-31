import {
	TAG_INPUT_CLEAR_POLL_MS,
	TAG_INPUT_CLEAR_WAIT_MS,
} from "./constants/cover-modal-timing.js";
import { waitMs } from "./wait-ms.js";

export async function waitForTagInputCleared(input: HTMLInputElement): Promise<void> {
	const deadline = Date.now() + TAG_INPUT_CLEAR_WAIT_MS;

	while (Date.now() < deadline) {
		if (!input.value.trim()) return;
		await waitMs(TAG_INPUT_CLEAR_POLL_MS);
	}
}
