export const STORAGE_KEY_CHANNELS_SUBMIT_BATCH_SIZE = "channelsSubmitBatchSize" as const;
export const STORAGE_KEY_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS =
	"channelsSubmitBatchIntervalSeconds" as const;

export const DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE = 4 as const;
export const MIN_CHANNELS_SUBMIT_BATCH_SIZE = 1 as const;
export const MAX_CHANNELS_SUBMIT_BATCH_SIZE = 20 as const;

export const MS_PER_SECOND = 1_000 as const;
export const DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS = 3 as const;
export const MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS = 1 as const;
export const MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS = 60 as const;
export const DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS =
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS * MS_PER_SECOND;

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

export function clampChannelsSubmitBatchIntervalSeconds(value: number): number {
	if (!Number.isFinite(value)) return DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS;
	return Math.min(
		MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
		Math.max(MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS, Math.round(value)),
	);
}

export function channelsSubmitBatchIntervalSecondsToMs(seconds: number): number {
	return clampChannelsSubmitBatchIntervalSeconds(seconds) * MS_PER_SECOND;
}

export function clampChannelsSubmitBatchIntervalMs(value: number): number {
	return channelsSubmitBatchIntervalSecondsToMs(value / MS_PER_SECOND);
}

export function resolveChannelsSubmitBatchConfig(input?: {
	batchSize?: number;
	batchIntervalMs?: number;
	batchIntervalSeconds?: number;
}): ChannelsSubmitBatchConfig {
	const intervalMs =
		input?.batchIntervalMs ??
		channelsSubmitBatchIntervalSecondsToMs(
			input?.batchIntervalSeconds ?? DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_SECONDS,
		);

	return {
		batchSize: clampChannelsSubmitBatchSize(
			input?.batchSize ?? DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
		),
		batchIntervalMs: clampChannelsSubmitBatchIntervalMs(intervalMs),
	};
}
