import {
	BATCH_PROGRESS_STORAGE_KEY,
	type BatchProgressEntry,
	type StoredBatchProgress,
} from "./batch-progress.js";

export async function clearBatchProgress(requestId: string): Promise<void> {
	const empty: StoredBatchProgress = { requestId, entries: [] };
	await chrome.storage.local.set({ [BATCH_PROGRESS_STORAGE_KEY]: empty });
}

export async function appendBatchProgress(entry: BatchProgressEntry): Promise<void> {
	const stored = await chrome.storage.local.get(BATCH_PROGRESS_STORAGE_KEY);
	const current = stored[BATCH_PROGRESS_STORAGE_KEY] as StoredBatchProgress | undefined;
	const entries = current?.requestId === entry.requestId ? [...current.entries, entry] : [entry];
	const next: StoredBatchProgress = { requestId: entry.requestId, entries };
	await chrome.storage.local.set({ [BATCH_PROGRESS_STORAGE_KEY]: next });
}
