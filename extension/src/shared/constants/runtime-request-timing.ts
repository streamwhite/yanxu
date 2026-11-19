import { Platform } from "@yanxu/domain";
import {
	CHANNELS_SUBMIT_PER_TAB_BUFFER_MS,
	CHANNELS_SUBMIT_TIMEOUT_BUFFER_MS,
	MAX_CHANNELS_SUBMIT_ASSUMED_TABS,
	resolveChannelsSubmitBatchConfig,
	type ChannelsSubmitBatchConfig,
} from "../channels-submit-batch-config.js";

/** Opening tabs only — short file read + tab create. */
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

export function resolveChannelsSubmitTimeoutMs(
	config?: Partial<ChannelsSubmitBatchConfig>,
): number {
	const resolved = resolveChannelsSubmitBatchConfig(config);
	const batchCount = Math.ceil(MAX_CHANNELS_SUBMIT_ASSUMED_TABS / resolved.batchSize);
	const intervalCount = Math.max(0, batchCount - 1);

	return (
		intervalCount * resolved.batchIntervalMs +
		MAX_CHANNELS_SUBMIT_ASSUMED_TABS * CHANNELS_SUBMIT_PER_TAB_BUFFER_MS +
		CHANNELS_SUBMIT_TIMEOUT_BUFFER_MS
	);
}

export function resolveRuntimeRequestTimeoutMs(message: Record<string, unknown>): number {
	const type = message.type;
	if (typeof type === "string" && BATCH_RUNTIME_MESSAGE_TYPES.has(type)) {
		return RUNTIME_REQUEST_TIMEOUT_BATCH_MS;
	}
	if (typeof type === "string" && OPEN_TABS_RUNTIME_MESSAGE_TYPES.has(type)) {
		return RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS;
	}
	if (type === "runtime.submitPlatformTabs" && message.platform === Platform.Channels) {
		return resolveChannelsSubmitTimeoutMs({
			batchSize:
				typeof message.channelsSubmitBatchSize === "number"
					? message.channelsSubmitBatchSize
					: undefined,
			batchIntervalMs:
				typeof message.channelsSubmitBatchIntervalMs === "number"
					? message.channelsSubmitBatchIntervalMs
					: undefined,
		});
	}
	return RUNTIME_REQUEST_TIMEOUT_OPEN_TABS_MS;
}
