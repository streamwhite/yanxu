import { PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";
import {
	countRequiredBatchItemsForPlatform,
	type JobOutlineForTabCount,
} from "./count-required-batch-items-for-platform.js";
import { PLATFORM_TAB_LABELS } from "./constants/platform-tab-labels.js";
import type { PlatformUploadTab } from "./query-platform-upload-tabs.js";
import { listPlatformUploadTabsForPlatform } from "./list-platform-upload-tabs-for-platform.js";

export type PlatformTabShortage = {
	platform: PlatformId;
	required: number;
	found: number;
};

export type BatchTabValidationResult =
	| { ok: true }
	| { ok: false; shortages: PlatformTabShortage[] };

function formatPlatformShortage(shortage: PlatformTabShortage): string {
	const label = PLATFORM_TAB_LABELS[shortage.platform];
	const itemLabel = shortage.required === 1 ? "item" : "items";
	return `${label}: ${String(shortage.required)} job ${itemLabel} → need ${String(shortage.required)} upload page tab(s), found ${String(shortage.found)}`;
}

export function formatBatchInsufficientTabsMessage(shortages: PlatformTabShortage[]): string {
	return shortages.map(formatPlatformShortage).join("; ");
}

export function validateBatchTabRequirements(
	outline: JobOutlineForTabCount,
	tabsByPlatform: Map<PlatformId, PlatformUploadTab[]>,
	platformIds: readonly PlatformId[] = PLATFORM_IDS,
): BatchTabValidationResult {
	const shortages: PlatformTabShortage[] = [];

	for (const platform of platformIds) {
		const required = countRequiredBatchItemsForPlatform(outline, platform);
		if (required === 0) continue;

		const found = listPlatformUploadTabsForPlatform(
			tabsByPlatform.get(platform) ?? [],
			platform,
		).length;

		if (found < required) {
			shortages.push({ platform, required, found });
		}
	}

	if (shortages.length === 0) return { ok: true };
	return { ok: false, shortages };
}
