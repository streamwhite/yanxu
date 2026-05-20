import { COVER_MODAL_POLL_MS, COVER_MODAL_WAIT_MS } from "./constants/cover-modal-timing.js";
import { findCoverModalUploadArea } from "./find-cover-modal-upload-area.js";
import { waitMs } from "./wait-ms.js";

export async function waitForCoverModalUploadArea(root: ParentNode): Promise<HTMLElement | null> {
	const deadline = Date.now() + COVER_MODAL_WAIT_MS;

	while (Date.now() < deadline) {
		const area = findCoverModalUploadArea(root);
		if (area) return area;

		await waitMs(COVER_MODAL_POLL_MS);
	}

	return null;
}
