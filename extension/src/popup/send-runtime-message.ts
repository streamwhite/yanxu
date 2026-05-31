import {
	RUNTIME_REQUEST_STORAGE_KEY,
	waitForRuntimeRequestResult,
} from "../shared/runtime-request-store.js";
import { resolveRuntimeRequestTimeoutMs } from "../shared/constants/runtime-request-timing.js";
import { RuntimeMessageType, type ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";

const NO_RECEIVER_PATTERN = /Receiving end does not exist/i;

export function createRuntimeRequestId(): string {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	return `req_${String(Date.now())}_${String(Math.random())}`;
}

export async function sendPingToServiceWorker(): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		chrome.runtime.sendMessage({ type: RuntimeMessageType.Ping }, (response: unknown) => {
			const lastError = chrome.runtime.lastError;
			if (lastError?.message) {
				reject(new Error(lastError.message));
				return;
			}
			if (!response || typeof response !== "object" || (response as { ok?: unknown }).ok !== true) {
				reject(new Error("ping_failed"));
				return;
			}
			resolve();
		});
	});
}

async function dispatchRuntimeJobMessage(payload: Record<string, unknown>): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		chrome.runtime.sendMessage(payload, () => {
			const lastError = chrome.runtime.lastError;
			if (!lastError?.message) {
				resolve();
				return;
			}
			if (NO_RECEIVER_PATTERN.test(lastError.message)) {
				reject(new Error(lastError.message));
				return;
			}
			// "Message port closed…" is expected: real result arrives via chrome.storage.
			resolve();
		});
	});
}

export async function sendRuntimeMessageWithTimeout<T extends ApplyJobFromRuntimeResult>(
	message: Record<string, unknown>,
	requestId: string = createRuntimeRequestId(),
): Promise<{ requestId: string; result: T }> {
	const payload = { ...message, requestId };

	await chrome.storage.local.remove(RUNTIME_REQUEST_STORAGE_KEY);
	await dispatchRuntimeJobMessage(payload);
	const timeoutMs = resolveRuntimeRequestTimeoutMs(payload);
	const result = (await waitForRuntimeRequestResult(requestId, timeoutMs)) as T;
	return { requestId, result };
}
