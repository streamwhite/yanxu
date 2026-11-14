import type { PlatformId } from "@yanxu/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { PLATFORM_TAB_LABELS } from "../sw/constants/platform-tab-labels.js";
import type { JobOutlineForTabCount } from "../sw/count-required-batch-items-for-platform.js";
import { listOutlineItemIndicesForPlatform } from "../sw/list-outline-item-indices-for-platform.js";

const ERROR_NO_ITEMS_SELECTED = "no_items_selected" as const;
const ERROR_INVALID_ITEM_SELECTION = "invalid_item_selection" as const;

export function validatePlatformItemSelection(
	outline: JobOutlineForTabCount,
	platform: PlatformId,
	selectedItemIndices: readonly number[] | undefined,
): ApplyJobFromRuntimeResult | null {
	if (selectedItemIndices === undefined) return null;

	const platformLabel = PLATFORM_TAB_LABELS[platform];
	if (selectedItemIndices.length === 0) {
		return {
			ok: false,
			code: ERROR_NO_ITEMS_SELECTED,
			message: `Select at least one ${platformLabel} job item to upload.`,
		};
	}

	const platformIndices = new Set(listOutlineItemIndicesForPlatform(outline, platform));
	for (const itemIndex of selectedItemIndices) {
		if (!platformIndices.has(itemIndex)) {
			return {
				ok: false,
				code: ERROR_INVALID_ITEM_SELECTION,
				message: `Job item ${String(itemIndex)} does not target ${platformLabel}.`,
			};
		}
	}

	return null;
}
