import { CHANNELS_KEEP_TAB_ACTIVE_INTERVAL_MS } from "../platforms/constants/platform-video-upload-timing.js";
import { reactivateTabForApply } from "./activate-tab-for-apply.js";

export async function withChannelsTabKeptActive<T>(
	tabId: number,
	operation: () => Promise<T>,
): Promise<T> {
	const interval = setInterval(() => {
		void reactivateTabForApply(tabId);
	}, CHANNELS_KEEP_TAB_ACTIVE_INTERVAL_MS);

	try {
		return await operation();
	} finally {
		clearInterval(interval);
	}
}
