import {
	detectPlatformFromUrl,
	isAllowedPlatformUrl,
	PLATFORM_IDS,
	type PlatformId,
} from "@auto-upload/domain";

export type PlatformUploadTab = {
	tabId: number;
	url: string;
	platform: PlatformId;
};

function compareTabsByIndex(a: PlatformUploadTab, b: PlatformUploadTab): number {
	return a.tabId - b.tabId;
}

function resolveTabUrl(tab: chrome.tabs.Tab): string {
	const committedUrl = tab.url?.trim() ?? "";
	if (committedUrl.length > 0 && committedUrl !== "about:blank") {
		return committedUrl;
	}

	return tab.pendingUrl?.trim() ?? "";
}

export async function queryPlatformUploadTabs(): Promise<PlatformUploadTab[]> {
	const tabs = await chrome.tabs.query({});
	const matched: PlatformUploadTab[] = [];

	for (const tab of tabs) {
		const tabId = tab.id;
		const url = resolveTabUrl(tab);
		if (!tabId) continue;

		const platform = detectPlatformFromUrl(url);
		if (!platform) continue;
		if (!isAllowedPlatformUrl(url, platform)) continue;

		matched.push({ tabId, url, platform });
	}

	return matched.sort(compareTabsByIndex);
}

export function groupTabsByPlatform(
	tabs: PlatformUploadTab[],
): Map<PlatformId, PlatformUploadTab[]> {
	const grouped = new Map<PlatformId, PlatformUploadTab[]>();
	for (const platform of PLATFORM_IDS) {
		grouped.set(platform, []);
	}

	for (const tab of tabs) {
		const list = grouped.get(tab.platform) ?? [];
		list.push(tab);
		grouped.set(tab.platform, list);
	}

	return grouped;
}
