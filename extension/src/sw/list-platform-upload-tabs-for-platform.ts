import { scorePlatformUploadUrl, type PlatformId } from "@yanxu/domain";
import type { PlatformUploadTab } from "./query-platform-upload-tabs.js";

function compareUploadTabPreference(a: PlatformUploadTab, b: PlatformUploadTab): number {
	// Keep slot mapping stable across upload/fill phases.
	// URL shape can change (e.g. Douyin upload -> post/video), but tab id does not.
	return a.tabId - b.tabId;
}

function isPlatformUploadPageTab(tab: PlatformUploadTab, platform: PlatformId): boolean {
	return tab.platform === platform && scorePlatformUploadUrl(tab.url, platform) > 0;
}

export function listPlatformUploadTabsForPlatform(
	tabs: PlatformUploadTab[],
	platform: PlatformId,
): PlatformUploadTab[] {
	return tabs
		.filter((tab) => isPlatformUploadPageTab(tab, platform))
		.sort(compareUploadTabPreference);
}
