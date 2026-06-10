import { waitMs } from "./wait-ms.js";

const DOCUMENT_VISIBLE_POLL_MS = 100 as const;

export async function waitForDocumentVisible(
	maxWaitMs: number,
): Promise<boolean> {
	const deadline = Date.now() + maxWaitMs;

	while (Date.now() < deadline) {
		if (document.visibilityState === "visible") return true;
		await waitMs(DOCUMENT_VISIBLE_POLL_MS);
	}

	return document.visibilityState === "visible";
}
