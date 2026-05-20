import type { AppliedJobPayload } from "@auto-upload/domain";
import { ContentMessageType } from "../content/content-message-type.js";
import { injectContentScriptIntoTab } from "./inject-content-script.js";

function isTabApplyResponse(
	value: unknown,
): value is { ok: true } | { ok: false; message: string } {
	if (!value || typeof value !== "object") return false;
	const candidate = value as { ok?: unknown };
	if (candidate.ok === true) return true;
	if (candidate.ok === false) {
		const msg = (value as { message?: unknown }).message;
		return typeof msg === "string";
	}
	return false;
}

async function sendApplyMessageOnce(
	tabId: number,
	payload: AppliedJobPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
	const responseUnknown = await chrome.tabs.sendMessage(tabId, {
		type: ContentMessageType.ApplyJob,
		payload,
	});

	if (!isTabApplyResponse(responseUnknown)) {
		throw new Error("unexpected_content_script_response");
	}

	return responseUnknown;
}

function isMissingReceiverError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return /Receiving end does not exist|Could not establish connection/i.test(error.message);
}

export async function sendApplyPayloadToTab(
	tabId: number,
	payload: AppliedJobPayload,
): Promise<void> {
	try {
		const response = await sendApplyMessageOnce(tabId, payload);
		if (!response.ok) throw new Error(response.message);
		return;
	} catch (error: unknown) {
		if (!isMissingReceiverError(error)) {
			const detail = error instanceof Error ? error.message : "unknown_error_detail";
			throw new Error(`content_script_unreachable:${detail}`);
		}
	}

	await injectContentScriptIntoTab(tabId);

	try {
		const response = await sendApplyMessageOnce(tabId, payload);
		if (!response.ok) throw new Error(response.message);
	} catch (retryError: unknown) {
		const detail = retryError instanceof Error ? retryError.message : "unknown_error_detail";
		throw new Error(
			`content_script_unreachable:${detail} — refresh the Bilibili upload tab and retry`,
		);
	}
}
