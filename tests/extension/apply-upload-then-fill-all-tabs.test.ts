import { ApplyPhase, Platform } from "@yanxu/domain";
import { BATCH_PLATFORM_SCOPE_ALL } from "../../extension/src/shared/batch-platform-scope";
import { applyUploadThenFillAllTabs } from "../../extension/src/sw/apply-upload-then-fill-all-tabs";
import * as batchSlotsModule from "../../extension/src/sw/apply-batch-slots-by-platform";
import * as prepareModule from "../../extension/src/sw/prepare-batch-apply-context";
import * as progressModule from "../../extension/src/shared/batch-progress-store";
import * as uploadStateModule from "../../extension/src/shared/batch-upload-state";

describe("applyUploadThenFillAllTabs", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it("applies bilibili, channels, and douyin with video then fields phases", async () => {
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({
			slots: [
				{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 },
				{ platform: Platform.Channels, tabId: 2, itemIndex: 0 },
				{ platform: Platform.Douyin, tabId: 3, itemIndex: 0 },
			],
		});
		jest.spyOn(progressModule, "clearBatchProgress").mockResolvedValue();
		const applySpy = jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockResolvedValue({ ok: true });
		const markSpy = jest.spyOn(uploadStateModule, "markBatchVideosUploaded").mockResolvedValue();

		const result = await applyUploadThenFillAllTabs("/tmp/job.json", "req-1", 10, BATCH_PLATFORM_SCOPE_ALL);

		expect(result.ok).toBe(true);
		expect(applySpy).toHaveBeenCalledTimes(6);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-1",
			[{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.FieldsOnly,
			"req-1",
			[{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-1",
			[{ platform: Platform.Channels, tabId: 2, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.FieldsOnly,
			"req-1",
			[{ platform: Platform.Channels, tabId: 2, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-1",
			[{ platform: Platform.Douyin, tabId: 3, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.FieldsOnly,
			"req-1",
			[{ platform: Platform.Douyin, tabId: 3, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
		expect(markSpy).toHaveBeenCalled();
	});

	it("runs channels video after bilibili and douyin video, then all fills", async () => {
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({
			slots: [
				{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 },
				{ platform: Platform.Channels, tabId: 2, itemIndex: 0 },
				{ platform: Platform.Douyin, tabId: 3, itemIndex: 0 },
			],
		});
		jest.spyOn(progressModule, "clearBatchProgress").mockResolvedValue();
		jest.spyOn(uploadStateModule, "markBatchVideosUploaded").mockResolvedValue();

		const callOrder: string[] = [];
		jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockImplementation(async (_path, phase, _req, slots) => {
				const platform = slots[0]?.platform ?? "unknown";
				callOrder.push(`${platform}:${phase}`);
				return { ok: true };
			});

		const result = await applyUploadThenFillAllTabs(
			"/tmp/job.json",
			"req-order",
			0,
			BATCH_PLATFORM_SCOPE_ALL,
		);

		expect(result.ok).toBe(true);
		const channelsVideoIndex = callOrder.indexOf(`${Platform.Channels}:${ApplyPhase.VideoOnly}`);
		const bilibiliVideoIndex = callOrder.indexOf(`${Platform.Bilibili}:${ApplyPhase.VideoOnly}`);
		const douyinVideoIndex = callOrder.indexOf(`${Platform.Douyin}:${ApplyPhase.VideoOnly}`);
		const douyinFieldsIndex = callOrder.indexOf(`${Platform.Douyin}:${ApplyPhase.FieldsOnly}`);
		const bilibiliFieldsIndex = callOrder.indexOf(`${Platform.Bilibili}:${ApplyPhase.FieldsOnly}`);
		expect(channelsVideoIndex).toBeGreaterThan(bilibiliVideoIndex);
		expect(channelsVideoIndex).toBeGreaterThan(douyinVideoIndex);
		expect(channelsVideoIndex).toBeLessThan(bilibiliFieldsIndex);
		expect(channelsVideoIndex).toBeLessThan(douyinFieldsIndex);
	});

	it("continues channels to FieldsOnly when VideoOnly fully fails", async () => {
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({
			slots: [{ platform: Platform.Channels, tabId: 2, itemIndex: 0 }],
		});
		jest.spyOn(progressModule, "clearBatchProgress").mockResolvedValue();
		jest.spyOn(uploadStateModule, "markBatchVideosUploaded").mockResolvedValue();
		const applySpy = jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockImplementation(async (_path, phase) => {
				if (phase === ApplyPhase.VideoOnly) {
					return { ok: false, code: "tab_apply_failed", message: "video_file_input_not_found" };
				}
				return { ok: true };
			});

		const result = await applyUploadThenFillAllTabs(
			"/tmp/job.json",
			"req-ch",
			0,
			BATCH_PLATFORM_SCOPE_ALL,
		);

		expect(result.ok).toBe(true);
		expect(applySpy).toHaveBeenCalledTimes(2);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			ApplyPhase.FieldsOnly,
			"req-ch",
			[{ platform: Platform.Channels, tabId: 2, itemIndex: 0 }],
			expect.objectContaining({ includeHorizontalCover: false }),
		);
	});

	it("surfaces a channels daily upload limit even if fields can still be filled", async () => {
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({
			slots: [{ platform: Platform.Channels, tabId: 2, itemIndex: 0 }],
		});
		jest.spyOn(progressModule, "clearBatchProgress").mockResolvedValue();
		jest.spyOn(uploadStateModule, "markBatchVideosUploaded").mockResolvedValue();
		jest.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform").mockImplementation(
			async (_path, phase) =>
				phase === ApplyPhase.VideoOnly
					? {
							ok: false,
							code: "upload_daily_limit_reached",
							message: "每日上传上限已达",
						}
					: { ok: true },
		);

		const result = await applyUploadThenFillAllTabs(
			"/tmp/job.json",
			"req-limit",
			0,
			BATCH_PLATFORM_SCOPE_ALL,
		);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.message).toContain("每日上传上限已达");
	});

	it("stops when prepare fails", async () => {
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({
			ok: false,
			code: "insufficient_tabs",
			message: "short",
		});
		const applySpy = jest.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform");

		const result = await applyUploadThenFillAllTabs(
			"/tmp/job.json",
			"req-2",
			0,
			BATCH_PLATFORM_SCOPE_ALL,
		);

		expect(result.ok).toBe(false);
		expect(applySpy).not.toHaveBeenCalled();
	});
});
