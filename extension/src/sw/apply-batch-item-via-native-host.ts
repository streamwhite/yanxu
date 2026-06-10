import { Platform, type ApplyPhase, type PlatformId } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import {
	activateChannelsTabForApply,
	activateTabForApply,
} from "./activate-tab-for-apply.js";
import { BILIBILI_ACTIVATE_TAB_SETTLE_MS } from "../platforms/constants/platform-video-upload-timing.js";
import { postNativeMessageSession } from "./post-native-message-session.js";
import { resolveApplyJobFromNativeSession } from "./resolve-apply-job-from-native-batch.js";
import { withChannelsTabKeptActive } from "./keep-channels-tab-active-while.js";
import { resolvePlatformTab } from "./resolve-platform-tab.js";
import { sendApplyBatchToTab } from "./send-apply-batch-to-tab.js";

export type ApplyBatchItemViaNativeHostInput = {
	jobFilePath: string;
	applyPhase: ApplyPhase;
	tabId: number;
	itemIndex: number;
	platform: PlatformId;
};

export async function applyBatchItemViaNativeHost(
	input: ApplyBatchItemViaNativeHostInput,
): Promise<ApplyJobFromRuntimeResult> {
	const tab = await resolvePlatformTab(input.tabId, input.platform);

	if (input.platform === Platform.Channels) {
		await activateChannelsTabForApply(tab.tabId);
	} else if (input.platform === Platform.Bilibili) {
		await activateTabForApply(tab.tabId, BILIBILI_ACTIVATE_TAB_SETTLE_MS);
	}

	const session = await postNativeMessageSession({
		type: "applyBatchItemFromFile",
		jobFilePath: input.jobFilePath,
		applyPhase: input.applyPhase,
		itemIndex: input.itemIndex,
		platform: input.platform,
	});
	const resolved = resolveApplyJobFromNativeSession(session);
	if (!resolved.ok) return resolved;

	const deliverToTab = () =>
		sendApplyBatchToTab(tab.tabId, resolved.batch).then(
			() => ({ ok: true as const }),
			(error: unknown) => ({
				ok: false as const,
				message: error instanceof Error ? error.message : "tab_apply_failed",
			}),
		);

	const tabResult =
		input.platform === Platform.Channels
			? await withChannelsTabKeptActive(tab.tabId, deliverToTab)
			: await deliverToTab();

	if (!tabResult.ok) {
		return { ok: false, code: "tab_apply_failed", message: tabResult.message };
	}

	return { ok: true };
}
