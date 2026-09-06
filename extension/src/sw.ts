import { ApplyPhase, Platform } from "@auto-upload/domain";
import { BATCH_PLATFORM_SCOPE_ALL } from "./shared/batch-platform-scope.js";
import { resolveChannelsSubmitBatchConfig } from "./shared/channels-submit-batch-config.js";
import { applyJobToAllTabs } from "./sw/apply-job-to-all-tabs.js";
import { applyUploadThenFillAllTabs } from "./sw/apply-upload-then-fill-all-tabs.js";
import {
	openAllPlatformUploadTabs,
	openPlatformUploadTabs,
} from "./sw/open-platform-upload-tabs.js";
import { clearActiveBatchRequestId, setActiveBatchRequestId } from "./sw/active-batch-request.js";
import { handleApplyProgressMessage } from "./sw/handle-apply-progress-message.js";
import { openOrFocusPopupWindow } from "./sw/open-popup-window.js";
import { DEFAULT_FIELDS_SETTLE_MS } from "./shared/fields-settle-config.js";
import { markBatchVideosUploaded } from "./shared/batch-upload-state.js";
import { storeRuntimeRequestResult } from "./shared/runtime-request-store.js";
import { runWithServiceWorkerKeepAlive } from "./sw/run-with-service-worker-keep-alive.js";
import { submitPlatformTabs } from "./sw/submit-platform-tabs.js";
import { inspectJobFileOutline } from "./sw/inspect-job-file-outline.js";
import {
	RuntimeFillAllTabsMessageSchema,
	RuntimeInspectJobFileMessageSchema,
	RuntimeMessageType,
	RuntimeOpenAllPlatformTabsMessageSchema,
	RuntimeOpenPlatformTabsMessageSchema,
	RuntimeSubmitPlatformTabsMessageSchema,
	RuntimeUploadAllTabsMessageSchema,
	RuntimeUploadAndFillAllTabsMessageSchema,
} from "./runtime/runtime-message.js";

const RUNTIME_ACK_PENDING = { ok: true as const, pending: true as const };

function runAllTabsRequestInBackground(
	requestId: string,
	jobFilePath: string,
	applyPhase: ApplyPhase,
): void {
	setActiveBatchRequestId(requestId);
	void runWithServiceWorkerKeepAlive(async () => {
		try {
			const result = await applyJobToAllTabs(jobFilePath, applyPhase, requestId);
			if (result.ok && applyPhase === ApplyPhase.VideoOnly) {
				await markBatchVideosUploaded(jobFilePath);
			}
			await storeRuntimeRequestResult(requestId, result);
		} catch (error: unknown) {
			const msg = error instanceof Error ? error.message : "unexpected_error";
			await storeRuntimeRequestResult(requestId, {
				ok: false,
				code: "internal_error",
				message: msg,
			});
		} finally {
			clearActiveBatchRequestId(requestId);
		}
	});
}

function startAllTabsRequest(
	requestId: string,
	jobFilePath: string,
	applyPhase: ApplyPhase,
	sendResponse: (response: typeof RUNTIME_ACK_PENDING) => void,
): boolean {
	sendResponse(RUNTIME_ACK_PENDING);
	runAllTabsRequestInBackground(requestId, jobFilePath, applyPhase);
	return false;
}

chrome.action.onClicked.addListener(() => {
	void openOrFocusPopupWindow();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (handleApplyProgressMessage(message)) return false;

	if (
		message &&
		typeof message === "object" &&
		(message as { type?: unknown }).type === RuntimeMessageType.Ping
	) {
		sendResponse({ ok: true });
		return false;
	}

	const inspectJob = RuntimeInspectJobFileMessageSchema.safeParse(message);
	if (inspectJob.success) {
		void inspectJobFileOutline(inspectJob.data.jobFilePath).then(sendResponse);
		return true;
	}

	const uploadAll = RuntimeUploadAllTabsMessageSchema.safeParse(message);
	if (uploadAll.success) {
		return startAllTabsRequest(
			uploadAll.data.requestId,
			uploadAll.data.jobFilePath,
			ApplyPhase.VideoOnly,
			sendResponse,
		);
	}

	const fillAll = RuntimeFillAllTabsMessageSchema.safeParse(message);
	if (fillAll.success) {
		return startAllTabsRequest(
			fillAll.data.requestId,
			fillAll.data.jobFilePath,
			ApplyPhase.FieldsOnly,
			sendResponse,
		);
	}

	const uploadAndFill = RuntimeUploadAndFillAllTabsMessageSchema.safeParse(message);
	if (uploadAndFill.success) {
		sendResponse(RUNTIME_ACK_PENDING);
		const {
			requestId,
			jobFilePath,
			fieldsSettleMs,
			batchPlatformScope,
			selectedPlatformItemIndices,
			submitHorizontalCover,
		} = uploadAndFill.data;
		setActiveBatchRequestId(requestId);
		void runWithServiceWorkerKeepAlive(async () => {
			try {
				const result = await applyUploadThenFillAllTabs(
					jobFilePath,
					requestId,
					fieldsSettleMs ?? DEFAULT_FIELDS_SETTLE_MS,
					batchPlatformScope ?? BATCH_PLATFORM_SCOPE_ALL,
					{ selectedPlatformItemIndices, submitHorizontalCover },
				);
				await storeRuntimeRequestResult(requestId, result);
			} catch (error: unknown) {
				const msg = error instanceof Error ? error.message : "unexpected_error";
				await storeRuntimeRequestResult(requestId, {
					ok: false,
					code: "internal_error",
					message: msg,
				});
			} finally {
				clearActiveBatchRequestId(requestId);
			}
		});
		return false;
	}

	const openTabs = RuntimeOpenPlatformTabsMessageSchema.safeParse(message);
	if (openTabs.success) {
		sendResponse(RUNTIME_ACK_PENDING);
		const { requestId, jobFilePath, platform } = openTabs.data;
		void runWithServiceWorkerKeepAlive(async () => {
			try {
				const result = await openPlatformUploadTabs(jobFilePath, platform);
				await storeRuntimeRequestResult(requestId, result);
			} catch (error: unknown) {
				const msg = error instanceof Error ? error.message : "unexpected_error";
				await storeRuntimeRequestResult(requestId, {
					ok: false,
					code: "internal_error",
					message: msg,
				});
			}
		});
		return false;
	}

	const openAllTabs = RuntimeOpenAllPlatformTabsMessageSchema.safeParse(message);
	if (openAllTabs.success) {
		sendResponse(RUNTIME_ACK_PENDING);
		const { requestId, jobFilePath, batchPlatformScope } = openAllTabs.data;
		void runWithServiceWorkerKeepAlive(async () => {
			try {
				const result = await openAllPlatformUploadTabs(
					jobFilePath,
					batchPlatformScope ?? BATCH_PLATFORM_SCOPE_ALL,
				);
				await storeRuntimeRequestResult(requestId, result);
			} catch (error: unknown) {
				const msg = error instanceof Error ? error.message : "unexpected_error";
				await storeRuntimeRequestResult(requestId, {
					ok: false,
					code: "internal_error",
					message: msg,
				});
			}
		});
		return false;
	}

	const submitPlatform = RuntimeSubmitPlatformTabsMessageSchema.safeParse(message);
	if (submitPlatform.success) {
		sendResponse(RUNTIME_ACK_PENDING);
		const { requestId, platform, channelsSubmitBatchSize, channelsSubmitBatchIntervalMs } =
			submitPlatform.data;
		void runWithServiceWorkerKeepAlive(async () => {
			try {
				const channelsBatch =
					platform === Platform.Channels
						? resolveChannelsSubmitBatchConfig({
								batchSize: channelsSubmitBatchSize,
								batchIntervalMs: channelsSubmitBatchIntervalMs,
							})
						: undefined;
				const result = await submitPlatformTabs(platform, { channelsBatch });
				await storeRuntimeRequestResult(requestId, result);
			} catch (error: unknown) {
				const msg = error instanceof Error ? error.message : "unexpected_error";
				await storeRuntimeRequestResult(requestId, {
					ok: false,
					code: "internal_error",
					message: msg,
				});
			}
		});
		return false;
	}

	return undefined;
});
