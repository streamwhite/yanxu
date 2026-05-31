import { detectPlatformFromUrl, isAllowedPlatformUrl, type PlatformId } from "@auto-upload/domain";

export type ResolvedPlatformTab = {
	tabId: number;
	url: string;
	platform: PlatformId;
};

function assertTabMatchesPlatform(url: string, expectedPlatform?: PlatformId): PlatformId {
	const detected = detectPlatformFromUrl(url);
	if (!detected) throw new Error("tab_not_supported_upload_page");
	if (expectedPlatform !== undefined && detected !== expectedPlatform) {
		throw new Error("tab_platform_mismatch");
	}
	return detected;
}

export async function resolvePlatformTab(
	preferredTabId?: number,
	expectedPlatform?: PlatformId,
): Promise<ResolvedPlatformTab> {
	if (preferredTabId !== undefined) {
		const tab = await chrome.tabs.get(preferredTabId);
		const url = tab.url ?? "";
		if (!tab.id) throw new Error("tab_has_no_id");
		const platform = assertTabMatchesPlatform(url, expectedPlatform);
		return { tabId: tab.id, url, platform };
	}

	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const tab = tabs[0];
	const tabId = tab?.id;
	const url = tab?.url ?? "";
	if (!tabId) throw new Error("no_active_tab");

	const platform = assertTabMatchesPlatform(url, expectedPlatform);
	if (!isAllowedPlatformUrl(url, platform)) {
		throw new Error("active_tab_not_supported");
	}

	return { tabId, url, platform };
}
