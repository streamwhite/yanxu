import { Platform } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import type { JobOutlineForTabCount } from "../sw/count-required-batch-items-for-platform.js";
import { listOutlineItemIndicesForPlatform } from "../sw/list-outline-item-indices-for-platform.js";

const ERROR_NO_ITEMS_SELECTED = "no_items_selected" as const;
const ERROR_INVALID_ITEM_SELECTION = "invalid_item_selection" as const;

export function validateChannelsItemSelection(
	outline: JobOutlineForTabCount,
	selectedItemIndices: readonly number[] | undefined,
): ApplyJobFromRuntimeResult | null {
	if (selectedItemIndices === undefined) return null;
	if (selectedItemIndices.length === 0) {
		return {
			ok: false,
			code: ERROR_NO_ITEMS_SELECTED,
			message: "Select at least one 视频号 job item to upload.",
		};
	}

	const channelsIndices = new Set(
		listOutlineItemIndicesForPlatform(outline, Platform.Channels),
	);
	for (const itemIndex of selectedItemIndices) {
		if (!channelsIndices.has(itemIndex)) {
			return {
				ok: false,
				code: ERROR_INVALID_ITEM_SELECTION,
				message: `Job item ${String(itemIndex)} does not target 视频号.`,
			};
		}
	}

	return null;
}
