import { NATIVE_HOST_NAME } from "@yanxu/domain";

const NATIVE_REPLY_TIMEOUT_MS = 120_000 as const;
const DISCONNECT_GRACE_MS = 50 as const;

export function postNativeMessageOnce(message: unknown): Promise<unknown> {
	return new Promise((resolve, reject) => {
		let settled = false;
		const port = chrome.runtime.connectNative(NATIVE_HOST_NAME);

		const lastError = chrome.runtime.lastError;
		if (lastError?.message) {
			reject(new Error(lastError.message));
			return;
		}

		const timer = globalThis.setTimeout(() => {
			finish(() => reject(new Error("native_host_timeout")));
		}, NATIVE_REPLY_TIMEOUT_MS);

		const finish = (fn: () => void) => {
			if (settled) return;
			settled = true;
			globalThis.clearTimeout(timer);
			try {
				port.disconnect();
			} catch {
				//
			}
			fn();
		};

		port.onMessage.addListener((response: unknown) => {
			finish(() => resolve(response));
		});

		port.onDisconnect.addListener(() => {
			if (settled) return;
			globalThis.setTimeout(() => {
				if (settled) return;
				const messageText = chrome.runtime.lastError?.message ?? "native_port_closed";
				finish(() => reject(new Error(messageText)));
			}, DISCONNECT_GRACE_MS);
		});

		port.postMessage(message);
	});
}
