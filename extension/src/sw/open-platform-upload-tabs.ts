import type { PlatformId } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import {
	BATCH_PLATFORM_SCOPE_ALL,
	type BatchPlatformScope,
	formatBatchPlatformScopeLabel,
	resolveBatchPlatformIds,
} from "../shared/batch-platform-scope.js";
import { PLATFORM_TAB_LABELS } from "./constants/platform-tab-labels.js";
import {
	countRequiredBatchItemsForPlatform,
	type JobOutlineForTabCount,
} from "./count-required-batch-items-for-platform.js";
import { assertBatchJobOutline } from "./assert-batch-job-outline.js";
import { createUploadTabsForPlatform } from "./create-upload-tabs-for-platform.js";
import { inspectJobFileOutline } from "./inspect-job-file-outline.js";

function countTabsToOpenForOutline(outline: JobOutlineForTabCount, platform: PlatformId): number {
	return countRequiredBatchItemsForPlatform(outline, platform);
}

export async function openPlatformUploadTabs(
	jobFilePath: string,
	platform: PlatformId,
): Promise<ApplyJobFromRuntimeResult> {
	const inspected = await inspectJobFileOutline(jobFilePath);
	if (!inspected.ok) {
		return { ok: false, code: inspected.code, message: inspected.message };
	}

	const batchOnly = assertBatchJobOutline(inspected);
	if (!batchOnly.ok) {
		return { ok: false, code: batchOnly.code, message: batchOnly.message };
	}

	const tabCount = countTabsToOpenForOutline(inspected.outline, platform);
	if (tabCount === 0) {
		const label = PLATFORM_TAB_LABELS[platform];
		return {
			ok: false,
			code: "no_platform_targets",
			message: `No job items target ${label}`,
		};
	}

	await createUploadTabsForPlatform(platform, tabCount);
	return { ok: true };
}

export async function openAllPlatformUploadTabs(
	jobFilePath: string,
	batchPlatformScope: BatchPlatformScope = BATCH_PLATFORM_SCOPE_ALL,
): Promise<ApplyJobFromRuntimeResult> {
	const inspected = await inspectJobFileOutline(jobFilePath);
	if (!inspected.ok) {
		return { ok: false, code: inspected.code, message: inspected.message };
	}

	const batchOnly = assertBatchJobOutline(inspected);
	if (!batchOnly.ok) {
		return { ok: false, code: batchOnly.code, message: batchOnly.message };
	}

	let openedAny = false;
	const platformIds = resolveBatchPlatformIds(batchPlatformScope);

	for (const platform of platformIds) {
		const tabCount = countTabsToOpenForOutline(inspected.outline, platform);
		if (tabCount === 0) continue;

		openedAny = true;
		await createUploadTabsForPlatform(platform, tabCount);
	}

	if (!openedAny) {
		const scopeLabel = formatBatchPlatformScopeLabel(batchPlatformScope);
		return {
			ok: false,
			code: "no_platform_targets",
			message: `No job items target ${scopeLabel}`,
		};
	}

	return { ok: true };
}
