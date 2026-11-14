import type { AppliedJobPayload, HostOutboundMessage } from "@yanxu/domain";
import {
	commitApplyJobHostBatch,
	pushApplyJobHostBatchPart,
	resetApplyJobHostBatch,
} from "./apply-job-host-batch.js";
import { applyJobPayload } from "./apply-job.js";
import { ContentMessageType } from "./content-message-type.js";

function isHostOutboundPart(value: unknown): value is HostOutboundMessage {
	if (!value || typeof value !== "object") return false;
	const candidate = value as { type?: unknown };
	return typeof candidate.type === "string";
}

export function registerApplyJobListener(): void {
	chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (!message || typeof message !== "object") return undefined;
		const candidate = message as { type?: unknown };

		if (candidate.type === ContentMessageType.ApplyJobStreamBegin) {
			resetApplyJobHostBatch();
			sendResponse({ ok: true });
			return true;
		}

		if (candidate.type === ContentMessageType.ApplyJobPart) {
			const part = (message as { part?: unknown }).part;
			if (!isHostOutboundPart(part)) {
				sendResponse({ ok: false, message: "invalid_apply_job_part" });
				return true;
			}

			pushApplyJobHostBatchPart(part);
			sendResponse({ ok: true });
			return true;
		}

		if (candidate.type === ContentMessageType.ApplyJobCommit) {
			void commitApplyJobHostBatch()
				.then(() => sendResponse({ ok: true }))
				.catch((error: unknown) => {
					const messageText = error instanceof Error ? error.message : "unexpected_error";
					sendResponse({ ok: false, message: messageText });
				});
			return true;
		}

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
