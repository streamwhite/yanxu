import {
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS,
	DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
	resolveChannelsSubmitBatchConfig,
} from "../../extension/src/shared/channels-submit-batch-config";
import { resolveChannelsSubmitTimeoutMs } from "../../extension/src/shared/constants/runtime-request-timing";

describe("channelsSubmitBatchConfig", () => {
	it("defaults batch size to 4 and interval to 3 seconds", () => {
		expect(resolveChannelsSubmitBatchConfig()).toEqual({
			batchSize: 4,
			batchIntervalMs: 3_000,
		});
		expect(DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE).toBe(4);
		expect(DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS).toBe(3_000);
	});

	it("clamps invalid batch settings", () => {
		expect(
			resolveChannelsSubmitBatchConfig({
				batchSize: 0,
				batchIntervalSeconds: 999,
			}),
		).toEqual({
			batchSize: 1,
			batchIntervalMs: 60_000,
		});
	});

	it("allocates enough timeout for batched channels submit", () => {
		const timeoutMs = resolveChannelsSubmitTimeoutMs();
		expect(timeoutMs).toBeGreaterThanOrEqual(DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS * 10);
	});
});
