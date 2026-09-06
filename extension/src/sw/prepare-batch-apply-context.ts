import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import {
	BATCH_PLATFORM_SCOPE_ALL,
	type BatchPlatformScope,
	isSinglePlatformScope,
	resolveBatchPlatformIds,
} from "../shared/batch-platform-scope.js";
import { filterBatchApplySlotsByItemIndices } from "../shared/filter-batch-apply-slots-by-item-indices.js";
import { validatePlatformItemSelection } from "../shared/validate-platform-item-selection.js";
import { assertBatchJobOutline } from "./assert-batch-job-outline.js";
import { PLATFORM_TAB_LABELS } from "./constants/platform-tab-labels.js";
import { buildBatchApplySlots, type BatchApplySlot } from "./build-batch-apply-slots.js";
import { checkBatchJobAssets } from "./check-batch-job-assets.js";
import { inspectJobFileOutline } from "./inspect-job-file-outline.js";
import { groupTabsByPlatform, queryPlatformUploadTabs } from "./query-platform-upload-tabs.js";
import {
	formatBatchInsufficientTabsMessage,
	validateBatchTabRequirements,
} from "./validate-batch-tab-requirements.js";

const ERROR_INSUFFICIENT_TABS = "insufficient_tabs" as const;

export type PreparedBatchApplyContext = {
	slots: BatchApplySlot[];
};

export type PrepareBatchApplyContextOptions = {
	batchPlatformScope?: BatchPlatformScope;
	selectedPlatformItemIndices?: number[];
};

export async function prepareBatchApplyContext(
	jobFilePath: string,
	options: PrepareBatchApplyContextOptions = {},
): Promise<ApplyJobFromRuntimeResult | PreparedBatchApplyContext> {
	const inspected = await inspectJobFileOutline(jobFilePath);
	if (!inspected.ok) {
		return { ok: false, code: inspected.code, message: inspected.message };
	}

	const batchOnly = assertBatchJobOutline(inspected);
	if (!batchOnly.ok) {
		return { ok: false, code: batchOnly.code, message: batchOnly.message };
	}

	const scope = options.batchPlatformScope ?? BATCH_PLATFORM_SCOPE_ALL;
	const scopedPlatform = isSinglePlatformScope(scope) ? scope : undefined;
	const selectionError =
		scopedPlatform === undefined
			? null
			: validatePlatformItemSelection(
					inspected.outline,
					scopedPlatform,
					options.selectedPlatformItemIndices,
				);
	if (selectionError) return selectionError;

	const tabs = await queryPlatformUploadTabs();
	const tabsByPlatform = groupTabsByPlatform(tabs);
	const platformIds = resolveBatchPlatformIds(scope);

	const tabCheck = validateBatchTabRequirements(inspected.outline, tabsByPlatform, platformIds);
	if (!tabCheck.ok) {
		return {
			ok: false,
			code: ERROR_INSUFFICIENT_TABS,
			message: formatBatchInsufficientTabsMessage(tabCheck.shortages),
		};
	}

	const assetCheck = await checkBatchJobAssets(jobFilePath);
	if (!assetCheck.ok) {
		return { ok: false, code: assetCheck.code, message: assetCheck.message };
	}

	let slots: BatchApplySlot[];
	try {
		slots = buildBatchApplySlots(inspected.outline, tabsByPlatform, platformIds);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "tab_slot_missing";
		return { ok: false, code: "tab_slot_missing", message };
	}

	if (slots.length === 0) {
		return { ok: false, code: "no_targets", message: "job has no platform targets" };
	}

	if (scopedPlatform !== undefined && options.selectedPlatformItemIndices !== undefined) {
		slots = filterBatchApplySlotsByItemIndices(
			slots,
			scopedPlatform,
			options.selectedPlatformItemIndices,
		);
		if (slots.length === 0) {
			return {
				ok: false,
				code: "no_targets",
				message: `no selected ${PLATFORM_TAB_LABELS[scopedPlatform]} items match open tabs`,
			};
		}
	}

	return { slots };
}
