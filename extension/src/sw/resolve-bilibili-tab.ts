import { isAllowedBilibiliMatchUrl } from "@auto-upload/domain";

export type ResolvedBilibiliTab = {
	tabId: number;
	url: string;
};

export async function resolveBilibiliTab(preferredTabId?: number): Promise<ResolvedBilibiliTab> {
	if (preferredTabId !== undefined) {
		const tab = await chrome.tabs.get(preferredTabId);
		const url = tab.url ?? "";
		if (!tab.id) throw new Error("tab_has_no_id");
		if (!isAllowedBilibiliMatchUrl(url)) {
			throw new Error("tab_not_bilibili_upload_page");
		}
		return { tabId: tab.id, url };
	}

	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	const tabId = tab?.id;
	const url = tab?.url ?? "";
	if (!tabId) throw new Error("no_active_tab");
	if (!isAllowedBilibiliMatchUrl(url)) {
		throw new Error("active_tab_not_bilibili");
	}

	return { tabId, url };
}
