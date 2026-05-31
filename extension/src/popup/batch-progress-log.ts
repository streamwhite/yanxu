import {
	BATCH_PROGRESS_STORAGE_KEY,
	formatBatchProgressLine,
	type StoredBatchProgress,
} from "../shared/batch-progress.js";

export function renderBatchProgressLog(
	container: HTMLElement,
	stored: StoredBatchProgress | undefined,
	requestId: string,
): void {
	if (!stored || stored.requestId !== requestId) {
		container.textContent = "";
		container.classList.add("d-none");
		return;
	}

	if (stored.entries.length === 0) {
		container.textContent = "";
		container.classList.add("d-none");
		return;
	}

	const lines = stored.entries.map((entry) => formatBatchProgressLine(entry));
	container.textContent = lines.join("\n");
	container.classList.remove("d-none");
}

export function listenBatchProgressLog(container: HTMLElement, requestId: string): () => void {
	const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
		if (areaName !== "local") return;
		const change = changes[BATCH_PROGRESS_STORAGE_KEY];
		if (!change?.newValue) return;
		renderBatchProgressLog(container, change.newValue as StoredBatchProgress, requestId);
	};

	chrome.storage.onChanged.addListener(listener);
	return () => chrome.storage.onChanged.removeListener(listener);
}
