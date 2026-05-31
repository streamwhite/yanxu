/** Opening tabs only — short native host + tab create. */
export const RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS = 60_000 as const;

/** Upload/fill across many tabs with chunked video transfer. */
export const RUNTIME_REQUEST_TIMEOUT_BATCH_MS = 900_000 as const;

/** Extend wait while batch progress storage updates for the same request. */
export const RUNTIME_REQUEST_TIMEOUT_BATCH_PROGRESS_SLACK_MS = 180_000 as const;

const BATCH_RUNTIME_MESSAGE_TYPES = new Set<string>([
	"runtime.uploadAllTabs",
	"runtime.fillAllTabs",
	"runtime.uploadAndFillAllTabs",
]);

const OPEN_TABS_RUNTIME_MESSAGE_TYPES = new Set<string>([
	"runtime.openPlatformTabs",
	"runtime.openAllPlatformTabs",
]);

export function resolveRuntimeRequestTimeoutMs(message: Record<string, unknown>): number {
	const type = message.type;
	if (typeof type === "string" && BATCH_RUNTIME_MESSAGE_TYPES.has(type)) {
		return RUNTIME_REQUEST_TIMEOUT_BATCH_MS;
	}
	if (typeof type === "string" && OPEN_TABS_RUNTIME_MESSAGE_TYPES.has(type)) {
		return RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS;
	}
	return RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS;
}
