import { waitMs } from "../content/wait-ms.js";
import { CHANNELS_ACTIVATE_TAB_SETTLE_MS } from "../platforms/constants/platform-video-upload-timing.js";

export const ACTIVATE_TAB_SETTLE_MS = 300 as const;

const TAB_EDIT_BLOCKED_RE = /Tabs cannot be edited/i;
const TAB_ACTIVATE_MAX_ATTEMPTS = 4 as const;
const TAB_ACTIVATE_RETRY_MS = 400 as const;

function isTabEditBlockedError(error: unknown): boolean {
	return error instanceof Error && TAB_EDIT_BLOCKED_RE.test(error.message);
}

export async function reactivateTabForApply(tabId: number): Promise<void> {
	for (let attempt = 0; attempt < TAB_ACTIVATE_MAX_ATTEMPTS; attempt += 1) {
		try {
			const tab = await chrome.tabs.get(tabId);
			await chrome.tabs.update(tabId, { active: true });
			if (tab.windowId !== undefined) {
				await chrome.windows.update(tab.windowId, { focused: true });
			}
			return;
		} catch (error: unknown) {
			if (!isTabEditBlockedError(error) || attempt >= TAB_ACTIVATE_MAX_ATTEMPTS - 1) {
				throw error;
			}
			await waitMs(TAB_ACTIVATE_RETRY_MS);
		}
	}
}

export async function activateTabForApply(
	tabId: number,
	settleMs: number = ACTIVATE_TAB_SETTLE_MS,
): Promise<void> {
	await reactivateTabForApply(tabId);
	await waitMs(settleMs);
}

export async function activateChannelsTabForApply(tabId: number): Promise<void> {
	await activateTabForApply(tabId, CHANNELS_ACTIVATE_TAB_SETTLE_MS);
}
