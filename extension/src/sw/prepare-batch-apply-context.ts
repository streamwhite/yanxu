import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { assertBatchJobOutline } from "./assert-batch-job-outline.js";
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

export async function prepareBatchApplyContext(
	jobFilePath: string,
): Promise<ApplyJobFromRuntimeResult | PreparedBatchApplyContext> {
	const inspected = await inspectJobFileOutline(jobFilePath);
	if (!inspected.ok) {
		return { ok: false, code: inspected.code, message: inspected.message };
	}

	const batchOnly = assertBatchJobOutline(inspected);
	if (!batchOnly.ok) {
		return { ok: false, code: batchOnly.code, message: batchOnly.message };
	}

	const tabs = await queryPlatformUploadTabs();
	const tabsByPlatform = groupTabsByPlatform(tabs);

	const tabCheck = validateBatchTabRequirements(inspected.outline, tabsByPlatform);
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
		slots = buildBatchApplySlots(inspected.outline, tabsByPlatform);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "tab_slot_missing";
		return { ok: false, code: "tab_slot_missing", message };
	}

	if (slots.length === 0) {
		return { ok: false, code: "no_targets", message: "job has no platform targets" };
	}

	return { slots };
}
