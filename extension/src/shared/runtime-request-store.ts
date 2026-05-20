import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";

export const RUNTIME_REQUEST_STORAGE_KEY = "runtimeRequestResult" as const;

const POLL_INTERVAL_MS = 200 as const;

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

export async function waitForRuntimeRequestResult(
	requestId: string,
	timeoutMs: number,
): Promise<ApplyJobFromRuntimeResult> {
	const started = Date.now();

	return new Promise((resolve, reject) => {
		const finish = (listener?: () => void) => {
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
			if (!changes[RUNTIME_REQUEST_STORAGE_KEY]) return;
			void tryRead();
		};

		chrome.storage.onChanged.addListener(listener);

		const poll = globalThis.setInterval(() => {
			if (Date.now() - started > timeoutMs) {
				globalThis.clearInterval(poll);
				finish(listener);
				reject(
					new Error(
						"service_worker_no_response — reload the extension on chrome://extensions and retry",
					),
				);
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
