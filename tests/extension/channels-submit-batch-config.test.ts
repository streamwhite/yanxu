import {
	channelsSubmitBatchIntervalMinToMs,
	DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS,
	DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
	resolveChannelsSubmitBatchConfig,
} from "../../extension/src/shared/channels-submit-batch-config";
import { resolveChannelsSubmitTimeoutMs } from "../../extension/src/shared/constants/runtime-request-timing";

describe("channelsSubmitBatchConfig", () => {
	it("defaults batch size to 5 and interval to 5 minutes", () => {
		expect(resolveChannelsSubmitBatchConfig()).toEqual({
			batchSize: DEFAULT_CHANNELS_SUBMIT_BATCH_SIZE,
			batchIntervalMs: DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS,
		});
	});

	it("clamps invalid batch settings", () => {
		expect(
			resolveChannelsSubmitBatchConfig({
				batchSize: 0,
				batchIntervalMin: 999,
			}),
		).toEqual({
			batchSize: 1,
			batchIntervalMs: channelsSubmitBatchIntervalMinToMs(60),
		});
	});

	it("allocates enough timeout for batched channels submit", () => {
		const timeoutMs = resolveChannelsSubmitTimeoutMs();
		expect(timeoutMs).toBeGreaterThanOrEqual(DEFAULT_CHANNELS_SUBMIT_BATCH_INTERVAL_MS * 10);
	});
});
