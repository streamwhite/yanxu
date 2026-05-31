export const BATCH_UPLOAD_STATE_KEY = "batchVideosUploadedForJob" as const;

export type BatchUploadState = {
	jobFilePath: string;
	uploadedAt: number;
};

export async function readBatchUploadState(): Promise<BatchUploadState | null> {
	const stored = await chrome.storage.local.get(BATCH_UPLOAD_STATE_KEY);
	const value = stored[BATCH_UPLOAD_STATE_KEY];
	if (!value || typeof value !== "object") return null;
	const candidate = value as BatchUploadState;
	if (typeof candidate.jobFilePath !== "string") return null;
	if (typeof candidate.uploadedAt !== "number") return null;
	return candidate;
}

export async function markBatchVideosUploaded(jobFilePath: string): Promise<void> {
	const state: BatchUploadState = { jobFilePath, uploadedAt: Date.now() };
	await chrome.storage.local.set({ [BATCH_UPLOAD_STATE_KEY]: state });
}

export async function clearBatchUploadState(): Promise<void> {
	await chrome.storage.local.remove(BATCH_UPLOAD_STATE_KEY);
}

export function isFillEnabledForJobPath(
	uploadState: BatchUploadState | null,
	jobFilePath: string,
): boolean {
	if (!uploadState) return false;
	return uploadState.jobFilePath === jobFilePath;
}
