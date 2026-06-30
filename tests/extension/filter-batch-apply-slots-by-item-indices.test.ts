import { Platform } from "@auto-upload/domain";
import { filterBatchApplySlotsByItemIndices } from "../../extension/src/shared/filter-batch-apply-slots-by-item-indices";
import type { BatchApplySlot } from "../../extension/src/sw/build-batch-apply-slots";

const slots: BatchApplySlot[] = [
	{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 },
	{ platform: Platform.Channels, tabId: 20, itemIndex: 0 },
	{ platform: Platform.Channels, tabId: 21, itemIndex: 1 },
	{ platform: Platform.Channels, tabId: 22, itemIndex: 2 },
	{ platform: Platform.Douyin, tabId: 30, itemIndex: 0 },
];

describe("filterBatchApplySlotsByItemIndices", () => {
	it("returns all slots when selectedItemIndices is undefined", () => {
		expect(filterBatchApplySlotsByItemIndices(slots, Platform.Channels, undefined)).toEqual(
			slots,
		);
	});

	it("keeps only selected channels slots", () => {
		expect(filterBatchApplySlotsByItemIndices(slots, Platform.Channels, [1, 2])).toEqual([
			{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 },
			{ platform: Platform.Channels, tabId: 21, itemIndex: 1 },
			{ platform: Platform.Channels, tabId: 22, itemIndex: 2 },
			{ platform: Platform.Douyin, tabId: 30, itemIndex: 0 },
		]);
	});
});
