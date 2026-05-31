import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { BATCH_PROGRESS_STORAGE_KEY } from "./batch-progress.js";
import { RUNTIME_REQUEST_TIMEOUT_BATCH_PROGRESS_SLACK_MS } from "./constants/runtime-request-timing.js";

export const RUNTIME_REQUEST_STORAGE_KEY = "runtimeRequestResult" as const;

const POLL_INTERVAL_MS = 200 as const;

const SERVICE_WORKER_NO_RESPONSE_MESSAGE =
	"service_worker_no_response: batch took too long or the service worker stopped. Reload the extension on chrome://extensions, refresh creator tabs, then retry." as const;

export type StoredRuntimeRequestResult = {
	requestId: string;
	result: ApplyJobFromRuntimeResult;
	at: number;
};

export async function storeRuntimeRequestResult(
	requestId: string,
	result: ApplyJobFromRuntimeResult,
): Promise<void> {
	const entry: StoredRuntimeRequestResult = { requestId, result, at: Date.now() };
	await chrome.storage.local.set({ [RUNTIME_REQUEST_STORAGE_KEY]: entry });
}

function extendsDeadlineOnBatchProgress(
	changes: Record<string, chrome.storage.StorageChange>,
	requestId: string,
	deadlineMs: { value: number },
): void {
	const progressChange = changes[BATCH_PROGRESS_STORAGE_KEY];
	if (!progressChange) return;

	const next = progressChange.newValue as { requestId?: string } | undefined;
	if (next?.requestId !== requestId) return;

	deadlineMs.value = Date.now() + RUNTIME_REQUEST_TIMEOUT_BATCH_PROGRESS_SLACK_MS;
}

export async function waitForRuntimeRequestResult(
	requestId: string,
	timeoutMs: number,
): Promise<ApplyJobFromRuntimeResult> {
	const deadlineMs = { value: Date.now() + timeoutMs };

	return new Promise((resolve, reject) => {
		const finish = (listener?: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void) => {
			if (listener) chrome.storage.onChanged.removeListener(listener);
		};

		const tryRead = async () => {
			const stored = await chrome.storage.local.get(RUNTIME_REQUEST_STORAGE_KEY);
			const entry = stored[RUNTIME_REQUEST_STORAGE_KEY] as StoredRuntimeRequestResult | undefined;
			if (entry?.requestId === requestId) {
				finish(listener);
				resolve(entry.result);
				return true;
			}
			return false;
		};

		const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
			if (areaName !== "local") return;
			extendsDeadlineOnBatchProgress(changes, requestId, deadlineMs);
			if (!changes[RUNTIME_REQUEST_STORAGE_KEY]) return;
			void tryRead();
		};

		chrome.storage.onChanged.addListener(listener);

		const poll = globalThis.setInterval(() => {
			if (Date.now() > deadlineMs.value) {
				globalThis.clearInterval(poll);
				finish(listener);
				reject(new Error(SERVICE_WORKER_NO_RESPONSE_MESSAGE));
				return;
			}
			void tryRead().then((done) => {
				if (done) globalThis.clearInterval(poll);
			});
		}, POLL_INTERVAL_MS);

		void tryRead().then((done) => {
			if (done) globalThis.clearInterval(poll);
		});
	});
}
