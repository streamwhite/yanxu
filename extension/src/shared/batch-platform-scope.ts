import { Platform, PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";
import { PLATFORM_TAB_LABELS } from "../sw/constants/platform-tab-labels.js";

export const BATCH_PLATFORM_SCOPE_ALL = "all" as const;

export type BatchPlatformScope = typeof BATCH_PLATFORM_SCOPE_ALL | PlatformId;

export const STORAGE_KEY_BATCH_PLATFORM_SCOPE = "semiAutoBatchPlatformScope" as const;

export function resolveBatchPlatformIds(
	scope: BatchPlatformScope = BATCH_PLATFORM_SCOPE_ALL,
): readonly PlatformId[] {
	if (scope === BATCH_PLATFORM_SCOPE_ALL) return PLATFORM_IDS;
	return [scope];
}

export function isSinglePlatformScope(scope: BatchPlatformScope): scope is PlatformId {
	return scope !== BATCH_PLATFORM_SCOPE_ALL;
}

export function parseBatchPlatformScope(value: unknown): BatchPlatformScope {
	if (value === BATCH_PLATFORM_SCOPE_ALL) return BATCH_PLATFORM_SCOPE_ALL;
	if (typeof value === "string" && (PLATFORM_IDS as readonly string[]).includes(value)) {
		return value as PlatformId;
	}
	return BATCH_PLATFORM_SCOPE_ALL;
}

export function formatBatchPlatformScopeLabel(scope: BatchPlatformScope): string {
	if (scope === BATCH_PLATFORM_SCOPE_ALL) return "bilibili, douyin, or channels";
	return PLATFORM_TAB_LABELS[scope];
}
