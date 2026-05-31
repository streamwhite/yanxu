import { waitMs } from "../content/wait-ms.js";
import { CHANNELS_ACTIVATE_TAB_SETTLE_MS } from "../platforms/constants/platform-video-upload-timing.js";

export const ACTIVATE_TAB_SETTLE_MS = 300 as const;

export async function activateTabForApply(
	tabId: number,
	settleMs: number = ACTIVATE_TAB_SETTLE_MS,
): Promise<void> {
	const tab = await chrome.tabs.get(tabId);
	await chrome.tabs.update(tabId, { active: true });
	if (tab.windowId !== undefined) {
		await chrome.windows.update(tab.windowId, { focused: true });
	}
	await waitMs(settleMs);
}

export async function activateChannelsTabForApply(tabId: number): Promise<void> {
	await activateTabForApply(tabId, CHANNELS_ACTIVATE_TAB_SETTLE_MS);
}
