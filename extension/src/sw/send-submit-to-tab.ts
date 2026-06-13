import type { PlatformId } from "@auto-upload/domain";
import { ContentMessageType } from "../content/content-message-type.js";
import { injectContentScriptIntoTab } from "./inject-content-script.js";

type TabSubmitResponse = { ok: true } | { ok: false; message: string };

function isTabSubmitResponse(value: unknown): value is TabSubmitResponse {
	if (!value || typeof value !== "object") return false;
	const candidate = value as { ok?: unknown };
	if (candidate.ok === true) return true;
	if (candidate.ok === false) {
		return typeof (value as { message?: unknown }).message === "string";
	}
	return false;
}

function isMissingReceiverError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	return /Receiving end does not exist|Could not establish connection/i.test(error.message);
}

async function sendSubmitMessageOnce(
	tabId: number,
	platform: PlatformId,
): Promise<TabSubmitResponse> {
	const responseUnknown = await chrome.tabs.sendMessage(tabId, {
		type: ContentMessageType.SubmitPlatform,
		platform,
	});
	if (!isTabSubmitResponse(responseUnknown)) {
		throw new Error("unexpected_content_script_response");
	}
	return responseUnknown;
}

export async function sendSubmitToTab(tabId: number, platform: PlatformId): Promise<void> {
	try {
		const response = await sendSubmitMessageOnce(tabId, platform);
		if (!response.ok) throw new Error(response.message);
		return;
	} catch (error: unknown) {
		if (!isMissingReceiverError(error)) throw error;
	}

	await injectContentScriptIntoTab(tabId);

	try {
		const response = await sendSubmitMessageOnce(tabId, platform);
		if (!response.ok) throw new Error(response.message);
	} catch (retryError: unknown) {
		if (!isMissingReceiverError(retryError)) throw retryError;
		const detail = retryError instanceof Error ? retryError.message : "unknown_error_detail";
		throw new Error(`content_script_unreachable:${detail}`);
	}
}
