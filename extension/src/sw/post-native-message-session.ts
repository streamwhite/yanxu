import { NATIVE_HOST_NAME } from "@yanxu/domain";
import type { HostOutboundMessage } from "@yanxu/domain";
import {
	NATIVE_DISCONNECT_GRACE_MS,
	NATIVE_HOST_SESSION_TIMEOUT_MS,
} from "./constants/native-session.js";

const TERMINAL_OUTBOUND_TYPES = new Set([
	"applyJobReady",
	"jobFileOutline",
	"batchAssetsReady",
	"error",
	"pong",
]);

export type NativeSessionResult =
	| { ok: true; batch: HostOutboundMessage[] }
	| { ok: false; code: string; message: string };

function isTerminalOutbound(message: HostOutboundMessage): boolean {
	return TERMINAL_OUTBOUND_TYPES.has(message.type);
}

export function postNativeMessageSession(message: unknown): Promise<NativeSessionResult> {
	return new Promise((resolve) => {
		let settled = false;
		const batch: HostOutboundMessage[] = [];
		const port = chrome.runtime.connectNative(NATIVE_HOST_NAME);

		const connectError = chrome.runtime.lastError;
		if (connectError?.message) {
			resolve({ ok: false, code: "native_connect_failed", message: connectError.message });
			return;
		}

		const timer = globalThis.setTimeout(() => {
			finish({
				ok: false,
				code: "native_host_timeout",
				message: "native_host_timeout",
			});
		}, NATIVE_HOST_SESSION_TIMEOUT_MS);

		const finish = (result: NativeSessionResult) => {
			if (settled) return;
			settled = true;
			globalThis.clearTimeout(timer);
			try {
				port.disconnect();
			} catch {
				//
			}
			resolve(result);
		};

		port.onMessage.addListener((response: unknown) => {
			if (!response || typeof response !== "object" || !("type" in response)) {
				finish({
					ok: false,
					code: "invalid_host_response",
					message: "host_response_not_object",
				});
				return;
			}

			const outbound = response as HostOutboundMessage;
			batch.push(outbound);

			if (outbound.type === "error") {
				finish({ ok: false, code: outbound.code, message: outbound.message });
				return;
			}

			if (isTerminalOutbound(outbound)) {
				finish({ ok: true, batch });
			}
		});

		port.onDisconnect.addListener(() => {
			if (settled) return;
			// lastError is only readable inside this callback; capture it before the grace timer.
			const disconnectReason = chrome.runtime.lastError?.message ?? "native_port_closed";
			globalThis.setTimeout(() => {
				if (settled) return;
				finish({ ok: false, code: "native_port_closed", message: disconnectReason });
			}, NATIVE_DISCONNECT_GRACE_MS);
		});

		port.postMessage(message);
	});
}
