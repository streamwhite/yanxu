import { Platform, type PlatformId } from "@auto-upload/domain";
import { BILIBILI_ACTIVATE_TAB_SETTLE_MS, DOUYIN_ACTIVATE_TAB_SETTLE_MS } from "../platforms/constants/platform-video-upload-timing.js";
import {
	ACTIVATE_TAB_SETTLE_MS,
	activateChannelsTabForApply,
	activateTabForApply,
} from "./activate-tab-for-apply.js";

export async function activateTabForSubmit(tabId: number, platform: PlatformId): Promise<void> {
	if (platform === Platform.Channels) {
		await activateChannelsTabForApply(tabId);
		return;
	}

	if (platform === Platform.Bilibili) {
		await activateTabForApply(tabId, BILIBILI_ACTIVATE_TAB_SETTLE_MS);
		return;
	}

	if (platform === Platform.Douyin) {
		await activateTabForApply(tabId, DOUYIN_ACTIVATE_TAB_SETTLE_MS);
		return;
	}

	await activateTabForApply(tabId, ACTIVATE_TAB_SETTLE_MS);
}
