import type { PlatformId } from "@auto-upload/domain";
import {
	BATCH_PLATFORM_SCOPE_ALL,
	type BatchPlatformScope,
	formatBatchPlatformScopeLabel,
	isSinglePlatformScope,
} from "../shared/batch-platform-scope.js";
import { PLATFORM_TAB_LABELS } from "../sw/constants/platform-tab-labels.js";

export function batchPlatformScopeOpenTabsHelp(scope: BatchPlatformScope): string {
	if (!isSinglePlatformScope(scope)) {
		return "Opens bilibili, douyin, and 视频号 tabs — one per job item per platform.";
	}

	return `Opens ${PLATFORM_TAB_LABELS[scope]} tabs only — one per job item targeting ${PLATFORM_TAB_LABELS[scope]}.`;
}

export function batchPlatformScopeUploadFillHelp(scope: BatchPlatformScope): string {
	if (!isSinglePlatformScope(scope)) {
		return "Uploads videos on all tabs, waits for pages to settle, then fills fields and cover.";
	}

	return `Uploads videos on ${PLATFORM_TAB_LABELS[scope]} tabs only, waits, then fills fields and cover.`;
}

export function batchPlatformScopeOpenTabsButtonLabel(scope: BatchPlatformScope): string {
	return isSinglePlatformScope(scope)
		? `Open ${PLATFORM_TAB_LABELS[scope]} tabs`
		: "Open all upload tabs";
}

export function batchPlatformScopeUploadFillButtonLabel(scope: BatchPlatformScope): string {
	return isSinglePlatformScope(scope)
		? `Upload and fill (${PLATFORM_TAB_LABELS[scope]} only)`
		: "Upload and fill (all tabs)";
}

export function batchPlatformScopeSinglePlatformHelp(scope: BatchPlatformScope): string {
	if (!isSinglePlatformScope(scope)) return "";
	return `Runs on ${formatBatchPlatformScopeLabel(scope)} only — use a job file with items that need re-upload.`;
}

export function platformItemSelectionLabel(platform: PlatformId): string {
	return `${PLATFORM_TAB_LABELS[platform]} items to upload`;
}

export function batchPlatformScopeOpeningLabel(scope: BatchPlatformScope): string {
	return isSinglePlatformScope(scope)
		? `Opening ${PLATFORM_TAB_LABELS[scope]} upload tabs…`
		: "Opening upload tabs for all platforms…";
}

export function batchPlatformScopeOpenedLabel(scope: BatchPlatformScope): string {
	return isSinglePlatformScope(scope)
		? `Opened ${PLATFORM_TAB_LABELS[scope]} upload tabs for this job.`
		: "Opened upload tabs for this job.";
}

export function batchPlatformScopeUploadBusyLabel(
	scope: BatchPlatformScope,
	fieldsSettleMs: number,
): string {
	const waitLabel = String(fieldsSettleMs);
	return isSinglePlatformScope(scope)
		? `Uploading ${PLATFORM_TAB_LABELS[scope]} videos, waiting ${waitLabel} ms, then filling fields…`
		: `Uploading videos, waiting ${waitLabel} ms, then filling fields…`;
}

export function batchPlatformScopeUploadSuccessLabel(scope: BatchPlatformScope): string {
	return isSinglePlatformScope(scope)
		? `${PLATFORM_TAB_LABELS[scope]} upload and fill finished. Review progress below, then publish manually.`
		: "Upload and fill finished. Review progress below, then publish manually.";
}

export function isBatchPlatformScopeValue(value: string): value is BatchPlatformScope {
	return value === BATCH_PLATFORM_SCOPE_ALL || value in PLATFORM_TAB_LABELS;
}
