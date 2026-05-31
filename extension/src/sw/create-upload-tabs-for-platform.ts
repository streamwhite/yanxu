import {
	PLATFORM_UPLOAD_PAGE_URLS,
	Platform,
	type PlatformId,
} from "@auto-upload/domain";
import { waitMs } from "../content/wait-ms.js";
import {
	CHANNELS_TAB_OPEN_RELOAD_SETTLE_MS,
	CHANNELS_TAB_OPEN_SETTLE_MS,
} from "../platforms/constants/platform-video-upload-timing.js";

export async function createUploadTabsForPlatform(
	platform: PlatformId,
	tabCount: number,
): Promise<void> {
	const url = PLATFORM_UPLOAD_PAGE_URLS[platform];
	const needsActiveLoad = platform === Platform.Channels;

	for (let index = 0; index < tabCount; index += 1) {
		if (needsActiveLoad) {
			const tab = await chrome.tabs.create({ url, active: true });
			await waitMs(CHANNELS_TAB_OPEN_SETTLE_MS);
			if (tab?.id !== undefined) {
				await chrome.tabs.reload(tab.id);
				await waitMs(CHANNELS_TAB_OPEN_RELOAD_SETTLE_MS);
			}
			continue;
		}

		const activate = index === tabCount - 1;
		await chrome.tabs.create({ url, active: activate });
	}
}
