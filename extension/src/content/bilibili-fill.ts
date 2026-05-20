import type { AppliedJobPayload } from "@auto-upload/domain";
import { applyJobPayload } from "./apply-job.js";
import { ContentMessageType } from "./content-message-type.js";

const LISTENER_REGISTERED_KEY = "__autoUploadFillListenerRegistered__" as const;

const globalRecord = globalThis as typeof globalThis & Record<string, boolean>;

if (globalRecord[LISTENER_REGISTERED_KEY]) {
	//
} else {
	globalRecord[LISTENER_REGISTERED_KEY] = true;
	registerApplyJobListener();
}

function registerApplyJobListener(): void {
	chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (!message || typeof message !== "object") return undefined;
		const candidate = message as { type?: unknown };
		if (candidate.type !== ContentMessageType.ApplyJob) return undefined;

		void applyJobPayload((message as { payload: AppliedJobPayload }).payload)
			.then(() => sendResponse({ ok: true }))
			.catch((error: unknown) => {
				const messageText = error instanceof Error ? error.message : "unexpected_error";
				sendResponse({ ok: false, message: messageText });
			});

		return true;
	});
}
