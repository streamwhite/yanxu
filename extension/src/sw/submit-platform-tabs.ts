import { Platform, type PlatformId } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { activateTabForSubmit } from "./activate-tab-for-submit.js";
import { PLATFORM_TAB_LABELS } from "./constants/platform-tab-labels.js";
import { listPlatformUploadTabsForPlatform } from "./list-platform-upload-tabs-for-platform.js";
import { groupTabsByPlatform, queryPlatformUploadTabs } from "./query-platform-upload-tabs.js";
import { sendSubmitToTab } from "./send-submit-to-tab.js";
import { waitRandomStaggerMs } from "./wait-random-stagger-ms.js";

const ERROR_NO_PLATFORM_TABS = "no_platform_tabs" as const;
const ERROR_SUBMIT_PARTIAL_FAILED = "submit_partial_failed" as const;

function formatTabSubmitFailure(tabId: number, error: unknown): string {
	const message = error instanceof Error ? error.message : "unexpected_error";
	return `tab ${String(tabId)}: ${message}`;
}

async function submitOneTab(tabId: number, platform: PlatformId): Promise<void> {
	await activateTabForSubmit(tabId, platform);
	await sendSubmitToTab(tabId, platform);
}

export async function submitPlatformTabs(platform: PlatformId): Promise<ApplyJobFromRuntimeResult> {
	const tabs = await queryPlatformUploadTabs();
	const tabsByPlatform = groupTabsByPlatform(tabs);
	const platformTabs = listPlatformUploadTabsForPlatform(
		tabsByPlatform.get(platform) ?? [],
		platform,
	);

	if (platformTabs.length === 0) {
		const label = PLATFORM_TAB_LABELS[platform];
		return {
			ok: false,
			code: ERROR_NO_PLATFORM_TABS,
			message: `No ${label} upload tabs found`,
		};
	}

	const failures: string[] = [];

	for (const tab of platformTabs) {
		try {
			await submitOneTab(tab.tabId, platform);
		} catch (error: unknown) {
			failures.push(formatTabSubmitFailure(tab.tabId, error));
		}

		await waitRandomStaggerMs();
	}

	if (failures.length > 0) {
		return {
			ok: false,
			code: ERROR_SUBMIT_PARTIAL_FAILED,
			message: failures.join("; "),
		};
	}

	return { ok: true };
}
