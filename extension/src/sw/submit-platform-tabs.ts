import { Platform, type PlatformId } from "@yanxu/domain";
import { waitMs } from "../content/wait-ms.js";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import type { ChannelsSubmitBatchConfig } from "../shared/channels-submit-batch-config.js";
import { activateTabForSubmit } from "./activate-tab-for-submit.js";
import { chunkTabIdsIntoBatches } from "./chunk-tab-ids-into-batches.js";
import { PLATFORM_TAB_LABELS } from "./constants/platform-tab-labels.js";
import { listPlatformUploadTabsForPlatform } from "./list-platform-upload-tabs-for-platform.js";
import type { PlatformUploadTab } from "./query-platform-upload-tabs.js";
import {
	groupTabsByPlatform,
	queryPlatformUploadTabs,
} from "./query-platform-upload-tabs.js";
import { sendSubmitToTab } from "./send-submit-to-tab.js";
import { waitRandomStaggerMs } from "./wait-random-stagger-ms.js";

const ERROR_NO_PLATFORM_TABS = "no_platform_tabs" as const;
const ERROR_SUBMIT_PARTIAL_FAILED = "submit_partial_failed" as const;

export type SubmitPlatformTabsOptions = {
	channelsBatch?: ChannelsSubmitBatchConfig;
};

function formatTabSubmitFailure(tabId: number, error: unknown): string {
	const message = error instanceof Error ? error.message : "unexpected_error";
	return `tab ${String(tabId)}: ${message}`;
}

async function submitOneTab(tabId: number, platform: PlatformId): Promise<void> {
	await activateTabForSubmit(tabId, platform);
	await sendSubmitToTab(tabId, platform);
}

async function submitTabsSequentially(
	tabs: readonly PlatformUploadTab[],
	platform: PlatformId,
): Promise<string[]> {
	const failures: string[] = [];

	for (const tab of tabs) {
		try {
			await submitOneTab(tab.tabId, platform);
		} catch (error: unknown) {
			failures.push(formatTabSubmitFailure(tab.tabId, error));
		}

		await waitRandomStaggerMs();
	}

	return failures;
}

async function submitTabsInBatches(
	tabs: readonly PlatformUploadTab[],
	platform: PlatformId,
	config: ChannelsSubmitBatchConfig,
): Promise<string[]> {
	const batches = chunkTabIdsIntoBatches([...tabs], config.batchSize);
	const failures: string[] = [];

	for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
		if (batchIndex > 0) {
			await waitMs(config.batchIntervalMs);
		}

		failures.push(...(await submitTabsSequentially(batches[batchIndex], platform)));
	}

	return failures;
}

function buildSubmitResult(failures: string[]): ApplyJobFromRuntimeResult {
	if (failures.length === 0) return { ok: true };

	return {
		ok: false,
		code: ERROR_SUBMIT_PARTIAL_FAILED,
		message: failures.join("; "),
	};
}

export async function submitPlatformTabs(
	platform: PlatformId,
	options?: SubmitPlatformTabsOptions,
): Promise<ApplyJobFromRuntimeResult> {
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

	const channelsBatch =
		platform === Platform.Channels ? options?.channelsBatch : undefined;
	const failures =
		channelsBatch === undefined
			? await submitTabsSequentially(platformTabs, platform)
			: await submitTabsInBatches(platformTabs, platform, channelsBatch);

	return buildSubmitResult(failures);
}
