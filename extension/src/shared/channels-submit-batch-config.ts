export const STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE = "channelsSubmitBatchSize" as const;
export const STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN =
	"channelsSubmitBatchIntervalMin" as const;

export const DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE = 5 as const;
export const MIN_CHANNELS_SUBMIT_BATCH_SIZE = 1 as const;
export const MAX_CHANNELS_SUBMIT_BATCH_SIZE = 20 as const;

export const MS_PER_MINUTE = 60_000 as const;
export const DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN = 5 as const;
export const MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN = 1 as const;
export const MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN = 60 as const;
export const DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS =
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN * MS_PER_MINUTE;

export const MAX_CHANNELS_SUBMIT_ASSUMED_TABS = 60 as const;
export const CHANNELS_SUBMIT_TIMEOUT_BUFFER_MS = 120_000 as const;
export const CHANNELS_SUBMIT_PER_TAB_BUFFER_MS = 3_000 as const;

export type ChannelsSubmitBatchConfig = {
	batchSize: number;
	batchIntervalMs: number;
};

export function clampChannelsSubmitBatchSize(value: number): number {
	if (!Number.isFinite(value)) return DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE;
	return Math.min(
		MAX_CHANNELS_SUBMIT_BATCH_SIZE,
		Math.max(MIN_CHANNELS_SUBMIT_BATCH_SIZE, Math.round(value)),
	);
}

export function clampChannelsSubmitBatchIntervalMin(value: number): number {
	if (!Number.isFinite(value)) return DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN;
	return Math.min(
		MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
		Math.max(MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN, Math.round(value)),
	);
}

export function channelsSubmitBatchIntervalMinToMs(minutes: number): number {
	return clampChannelsSubmitBatchIntervalMin(minutes) * MS_PER_MINUTE;
}

export function clampChannelsSubmitBatchIntervalMs(value: number): number {
	return channelsSubmitBatchIntervalMinToMs(value / MS_PER_MINUTE);
}

export function resolveChannelsSubmitBatchConfig(input?: {
	batchSize?: number;
	batchIntervalMs?: number;
	batchIntervalMin?: number;
}): ChannelsSubmitBatchConfig {
	const intervalMs =
		input?.batchIntervalMs ??
		channelsSubmitBatchIntervalMinToMs(
			input?.batchIntervalMin ?? DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
		);

	return {
		batchSize: clampChannelsSubmitBatchSize(
			input?.batchSize ?? DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
		),
		batchIntervalMs: clampChannelsSubmitBatchIntervalMs(intervalMs),
	};
}
