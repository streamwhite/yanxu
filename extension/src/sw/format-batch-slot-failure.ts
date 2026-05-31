import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import type { BatchApplySlot } from "./build-batch-apply-slots.js";

export function formatBatchSlotFailure(
	slot: BatchApplySlot,
	result: ApplyJobFromRuntimeResult,
): string {
	if (result.ok) return "";
	return `${slot.platform} item ${String(slot.itemIndex)} (tab ${String(slot.tabId)}): ${result.message}`;
}
