import { ApplyPhase } from "@auto-upload/domain";
import { postNativeMessageSession } from "./sw/post-native-message-session.js";
import { resolveApplyJobFromNativeSession } from "./sw/resolve-apply-job-from-native-batch.js";
import { acquireServiceWorkerKeepAlive } from "./sw/service-worker-keep-alive.js";
import { resolveBilibiliTab } from "./sw/resolve-bilibili-tab.js";
import { sendApplyPayloadToTab } from "./sw/send-apply-to-tab.js";
import { storeRuntimeRequestResult } from "./shared/runtime-request-store.js";
import {
	type ApplyJobFromRuntimeResult,
	RuntimeApplyJobFromFileMessageSchema,
	RuntimeFillFieldsMessageSchema,
	RuntimeMessageType,
	RuntimeUploadVideoFirstMessageSchema,
} from "./runtime/runtime-message.js";

const RUNTIME_ACK_PENDING = { ok: true as const, pending: true as const };

async function applyJobViaNativeHost(
	jobFilePath: string,
	applyPhase: ApplyPhase,
	tabId?: number,
): Promise<ApplyJobFromRuntimeResult> {
	const releaseKeepAlive = acquireServiceWorkerKeepAlive();
	try {
		const session = await postNativeMessageSession({
			type: "applyJobFromFile",
			jobFilePath,
			applyPhase,
		});
		const resolved = resolveApplyJobFromNativeSession(session);
		if (!resolved.ok) return resolved;

		const tab = await resolveBilibiliTab(tabId);
		await sendApplyPayloadToTab(tab.tabId, resolved.payload);
		return { ok: true };
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : "unexpected_error";
		return { ok: false, code: "apply_failed", message: msg };
	} finally {
		releaseKeepAlive();
	}
}

function runJobRequestInBackground(
	requestId: string,
	jobFilePath: string,
	applyPhase: ApplyPhase,
	tabId?: number,
): void {
	void (async () => {
		try {
			const result = await applyJobViaNativeHost(jobFilePath, applyPhase, tabId);
			await storeRuntimeRequestResult(requestId, result);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "unexpected_error";
			await storeRuntimeRequestResult(requestId, {
				ok: false,
				code: "internal_error",
				message: msg,
			});
		}
	})();
}

function startJobRequest(
	requestId: string,
	jobFilePath: string,
	applyPhase: ApplyPhase,
	tabId: number | undefined,
	sendResponse: (response: typeof RUNTIME_ACK_PENDING) => void,
): boolean {
	sendResponse(RUNTIME_ACK_PENDING);
	runJobRequestInBackground(requestId, jobFilePath, applyPhase, tabId);
	return false;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (
		message &&
		typeof message === "object" &&
		(message as { type?: unknown }).type === RuntimeMessageType.Ping
	) {
		sendResponse({ ok: true });
		return false;
	}

	const uploadVideo = RuntimeUploadVideoFirstMessageSchema.safeParse(message);
	if (uploadVideo.success) {
		return startJobRequest(
			uploadVideo.data.requestId,
			uploadVideo.data.jobFilePath,
			ApplyPhase.VideoOnly,
			uploadVideo.data.tabId,
			sendResponse,
		);
	}

	const fillFields = RuntimeFillFieldsMessageSchema.safeParse(message);
	if (fillFields.success) {
		return startJobRequest(
			fillFields.data.requestId,
			fillFields.data.jobFilePath,
			ApplyPhase.FieldsOnly,
			fillFields.data.tabId,
			sendResponse,
		);
	}

	const applyAll = RuntimeApplyJobFromFileMessageSchema.safeParse(message);
	if (applyAll.success) {
		return startJobRequest(
			applyAll.data.requestId,
			applyAll.data.jobFilePath,
			ApplyPhase.Full,
			applyAll.data.tabId,
			sendResponse,
		);
	}

	return undefined;
});
