import {
	UPLOAD_DAILY_LIMIT,
	UPLOAD_DAILY_WINDOW_MS,
	UPLOAD_RATE_LIMIT_STORAGE_KEY,
	acquireVideoUploadPermit,
	evaluateUploadRateLimit,
	type UploadRateLimitState,
} from "../../extension/src/sw/upload-rate-limit";

describe("evaluateUploadRateLimit", () => {
	afterEach(() => {
		jest.useRealTimers();
		delete (globalThis as { chrome?: unknown }).chrome;
	});

	it("allows repeat uploads on the same platform while under the daily quota", () => {
		const state: UploadRateLimitState = {
			platformUploadTimes: { bilibili: [1_000] },
		};

		expect(evaluateUploadRateLimit(state, "bilibili", 2_000)).toEqual({
			kind: "allowed",
			state: {
				platformUploadTimes: { bilibili: [1_000, 2_000] },
			},
		});
	});

	it("blocks a platform at 30 uploads in a rolling 24-hour window", () => {
		const now = 2 * UPLOAD_DAILY_WINDOW_MS;
		const firstUpload = now - UPLOAD_DAILY_WINDOW_MS + 1;
		const state: UploadRateLimitState = {
			platformUploadTimes: {
				channels: Array.from({ length: UPLOAD_DAILY_LIMIT }, (_, index) => firstUpload + index),
			},
		};

		expect(evaluateUploadRateLimit(state, "channels", now)).toEqual({
			kind: "blocked",
			retryAt: firstUpload + UPLOAD_DAILY_WINDOW_MS,
		});
	});

	it("keeps another platform unaffected by one platform's quota", () => {
		const now = 2 * UPLOAD_DAILY_WINDOW_MS;
		const state: UploadRateLimitState = {
			platformUploadTimes: {
				douyin: Array.from(
					{ length: UPLOAD_DAILY_LIMIT },
					(_, index) => now - UPLOAD_DAILY_WINDOW_MS + 1 + index,
				),
			},
		};

		expect(evaluateUploadRateLimit(state, "bilibili", now).kind).toBe("allowed");
	});

	it("drops expired history and records the permitted upload", () => {
		const now = 3 * UPLOAD_DAILY_WINDOW_MS;
		const state: UploadRateLimitState = {
			platformUploadTimes: {
				bilibili: [now - UPLOAD_DAILY_WINDOW_MS, now - UPLOAD_DAILY_WINDOW_MS + 1],
			},
		};

		expect(evaluateUploadRateLimit(state, "bilibili", now)).toEqual({
			kind: "allowed",
			state: {
				platformUploadTimes: { bilibili: [now - UPLOAD_DAILY_WINDOW_MS + 1, now] },
			},
		});
	});

	it("persists every concurrent reservation", async () => {
		jest.useFakeTimers();
		jest.setSystemTime(100_000);
		const data: Record<string, unknown> = {};
		Object.defineProperty(globalThis, "chrome", {
			configurable: true,
			value: {
				storage: {
					local: {
						get: async (key: string) => ({ [key]: data[key] }),
						set: async (values: Record<string, unknown>) => Object.assign(data, values),
					},
				},
			},
		});

		const [first, second] = await Promise.all([
			acquireVideoUploadPermit("bilibili"),
			acquireVideoUploadPermit("douyin"),
		]);

		expect(first).toEqual({ allowed: true });
		expect(second).toEqual({ allowed: true });
		expect(data[UPLOAD_RATE_LIMIT_STORAGE_KEY]).toEqual({
			platformUploadTimes: {
				bilibili: [100_000],
				douyin: [100_000],
			},
		});
	});
});
