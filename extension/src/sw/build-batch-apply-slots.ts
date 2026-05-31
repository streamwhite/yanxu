import { PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";
import {
	countRequiredBatchItemsForPlatform,
	type JobOutlineForTabCount,
} from "./count-required-batch-items-for-platform.js";
import { listOutlineItemIndicesForPlatform } from "./list-outline-item-indices-for-platform.js";
import type { PlatformUploadTab } from "./query-platform-upload-tabs.js";
import { listPlatformUploadTabsForPlatform } from "./list-platform-upload-tabs-for-platform.js";

export type BatchApplySlot = {
	platform: PlatformId;
	tabId: number;
	itemIndex: number;
};

export function buildBatchApplySlots(
	outline: JobOutlineForTabCount,
	tabsByPlatform: Map<PlatformId, PlatformUploadTab[]>,
): BatchApplySlot[] {
	const slots: BatchApplySlot[] = [];

	for (const platform of PLATFORM_IDS) {
		const requiredCount = countRequiredBatchItemsForPlatform(outline, platform);
		if (requiredCount === 0) continue;

		const platformTabs = listPlatformUploadTabsForPlatform(
			tabsByPlatform.get(platform) ?? [],
			platform,
		);

		const itemIndices = listOutlineItemIndicesForPlatform(outline, platform);
		if (itemIndices.length !== requiredCount) {
			throw new Error("batch_item_index_count_mismatch");
		}

		for (let slot = 0; slot < requiredCount; slot += 1) {
			const tab = platformTabs[slot];
			const itemIndex = itemIndices[slot];
			if (!tab || itemIndex === undefined) {
				throw new Error("tab_slot_missing");
			}
			slots.push({ platform, tabId: tab.tabId, itemIndex });
		}
	}

	return slots;
}
