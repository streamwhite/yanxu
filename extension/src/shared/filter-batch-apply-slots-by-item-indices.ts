import type { PlatformId } from "@yanxu/domain";
import type { BatchApplySlot } from "../sw/build-batch-apply-slots.js";

export function filterBatchApplySlotsByItemIndices(
	slots: BatchApplySlot[],
	platform: PlatformId,
	selectedItemIndices: readonly number[] | undefined,
): BatchApplySlot[] {
	if (selectedItemIndices === undefined) return slots;

	const selected = new Set(selectedItemIndices);
	return slots.filter(
		(slot) => slot.platform !== platform || selected.has(slot.itemIndex),
	);
}
