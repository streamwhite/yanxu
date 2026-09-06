import type { AppliedJobPayload, HostOutboundMessage } from "@auto-upload/domain";
import { ContentMessageType } from "../content/content-message-type.js";
import { TAB_MESSAGE_SAFE_BYTES } from "../shared/constants/tab-message-limits.js";
import { estimateJsonUtf8ByteLength } from "../shared/estimate-json-utf8-byte-length.js";
import { mergeStreamsIntoApplyPayload } from "../shared/merge-streams-into-payload.js";
import { injectContentScriptIntoTab } from "./inject-content-script.js";

type TabApplyResponse = { ok: true } | { ok: false; message: string };

function isTabApplyResponse(value: unknown): value is TabApplyResponse {
	if (!value || typeof value !== "object") return false;
	const candidate = value as { ok?: unknown };
	if (candidate.ok === true) return true;
	if (candidate.ok === false) {
		const msg = (value as { message?: unknown }).message;
		return typeof msg === "string";
	}
	return false;
}

function isMissingReceiverError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return /Receiving end does not exist|Could not establish connection/i.test(error.message);
}

function wrapTabMessageSizeError(error: unknown): Error {
	if (!(error instanceof Error)) return new Error("tab_send_message_failed");
	if (!/maximum allowed size/i.test(error.message)) return error;
	return new Error(
		"tab_message_too_large: Chrome limits one extension message to 64 MiB; base64 video data is larger. Rebuild/reload the extension so video is streamed in small frames, or use a smaller file.",
	);
}

async function sendTabMessageOnce(tabId: number, message: Record<string, unknown>): Promise<TabApplyResponse> {
	try {
		const responseUnknown = await chrome.tabs.sendMessage(tabId, message);
		if (!isTabApplyResponse(responseUnknown)) {
			throw new Error("unexpected_content_script_response");
		}
		return responseUnknown;
	} catch (error: unknown) {
		throw wrapTabMessageSizeError(error);
	}
}

function terminalApplyJobReady(batch: HostOutboundMessage[]) {
	const terminal = batch[batch.length - 1];
	if (!terminal || terminal.type !== "applyJobReady") {
		throw new Error("apply_job_batch_missing_ready");
	}
	return terminal.payload;
}

function mergedPayloadFromBatch(batch: HostOutboundMessage[]): AppliedJobPayload {
	return mergeStreamsIntoApplyPayload(batch, terminalApplyJobReady(batch));
}

function shouldStreamBatchToTab(batch: HostOutboundMessage[]): boolean {
	if (
		batch.some(
			(message) =>
				message.type === "videoStreamChunk" ||
				message.type === "coverStreamChunk" ||
				message.type === "horizontalCoverStreamChunk",
		)
	) {
		return true;
	}

	const merged = mergedPayloadFromBatch(batch);
	const envelope = { type: ContentMessageType.ApplyJob, payload: merged };
	return estimateJsonUtf8ByteLength(envelope) > TAB_MESSAGE_SAFE_BYTES;
}

async function sendApplyJobEnvelope(
	tabId: number,
	payload: AppliedJobPayload,
): Promise<void> {
	const response = await sendTabMessageOnce(tabId, {
		type: ContentMessageType.ApplyJob,
		payload,
	});
	if (!response.ok) throw new Error(response.message);
}

async function sendStreamedBatchToTab(tabId: number, batch: HostOutboundMessage[]): Promise<void> {
	const begin = await sendTabMessageOnce(tabId, {
		type: ContentMessageType.ApplyJobStreamBegin,
	});
	if (!begin.ok) throw new Error(begin.message);

	for (const part of batch) {
		const partResponse = await sendTabMessageOnce(tabId, {
			type: ContentMessageType.ApplyJobPart,
			part,
		});
		if (!partResponse.ok) throw new Error(partResponse.message);
	}

	const commit = await sendTabMessageOnce(tabId, {
		type: ContentMessageType.ApplyJobCommit,
	});
	if (!commit.ok) throw new Error(commit.message);
}

async function deliverBatchToTab(tabId: number, batch: HostOutboundMessage[]): Promise<void> {
	if (shouldStreamBatchToTab(batch)) {
		await sendStreamedBatchToTab(tabId, batch);
		return;
	}

	await sendApplyJobEnvelope(tabId, mergedPayloadFromBatch(batch));
}

export async function sendApplyBatchToTab(
	tabId: number,
	batch: HostOutboundMessage[],
): Promise<void> {
	try {
		await deliverBatchToTab(tabId, batch);
		return;
	} catch (error: unknown) {
		if (!isMissingReceiverError(error)) throw error;
	}

	await injectContentScriptIntoTab(tabId);

	try {
		await deliverBatchToTab(tabId, batch);
	} catch (retryError: unknown) {
		if (!isMissingReceiverError(retryError)) throw retryError;
		const detail = retryError instanceof Error ? retryError.message : "unknown_error_detail";
		throw new Error(
			`content_script_unreachable:${detail} — refresh the creator upload tab and retry`,
		);
	}
}
