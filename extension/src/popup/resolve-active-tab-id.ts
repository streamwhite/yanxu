import { isAllowedBilibiliMatchUrl } from "@auto-upload/domain";

export async function resolveActiveBilibiliTabId(): Promise<number> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	const tabId = tab?.id;
	const url = tab?.url ?? "";

	if (!tabId) {
		throw new Error("No active tab — focus the Bilibili upload tab first.");
	}

	if (!isAllowedBilibiliMatchUrl(url)) {
		throw new Error(
			`Active tab is not Bilibili (${url || "empty"}). Open the creator upload page, then click the extension again.`,
		);
	}

	return tabId;
}
