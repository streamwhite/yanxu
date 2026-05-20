import { COVER_FILE_INPUT_WAIT_MS, COVER_MODAL_POLL_MS } from "./constants/cover-modal-timing.js";
import { findCoverFileInputNearUploadArea } from "./find-cover-file-input.js";
import { waitMs } from "./wait-ms.js";

export async function waitForCoverFileInputNearUploadArea(
	uploadArea: HTMLElement,
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + COVER_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findCoverFileInputNearUploadArea(uploadArea);
		if (input) return input;

		await waitMs(COVER_MODAL_POLL_MS);
	}

	return null;
}
