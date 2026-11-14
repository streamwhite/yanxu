import { Platform } from "@yanxu/domain";
import { BATCH_PLATFORM_SCOPE_ALL } from "../../extension/src/shared/batch-platform-scope";
import { applyUploadThenFillAllTabs } from "../../extension/src/sw/apply-upload-then-fill-all-tabs";
import * as batchSlotsModule from "../../extension/src/sw/apply-batch-slots-by-platform";
import * as checkAssetsModule from "../../extension/src/sw/check-batch-job-assets";
import * as prepareModule from "../../extension/src/sw/prepare-batch-apply-context";
import * as progressModule from "../../extension/src/shared/batch-progress-store";
import * as uploadStateModule from "../../extension/src/shared/batch-upload-state";

const SLOTS = [{ platform: Platform.Douyin, tabId: 3, itemIndex: 0 }];

describe("applyUploadThenFillAllTabs submitHorizontalCover", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.spyOn(prepareModule, "prepareBatchApplyContext").mockResolvedValue({ slots: SLOTS });
		jest.spyOn(progressModule, "clearBatchProgress").mockResolvedValue();
		jest.spyOn(uploadStateModule, "markBatchVideosUploaded").mockResolvedValue();
	});

	it("does not run horizontal asset check when option is off", async () => {
		const checkSpy = jest
			.spyOn(checkAssetsModule, "checkBatchJobAssets")
			.mockResolvedValue({ ok: true });
		const applySpy = jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockResolvedValue({ ok: true });

		const result = await applyUploadThenFillAllTabs("/tmp/job.json", "req-1", 10, BATCH_PLATFORM_SCOPE_ALL);

		expect(result.ok).toBe(true);
		expect(checkSpy).not.toHaveBeenCalled();
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			expect.any(String),
			"req-1",
			SLOTS,
			expect.objectContaining({ includeHorizontalCover: false }),
		);
	});

	it("fails fast when a horizontal cover is missing", async () => {
		jest.spyOn(checkAssetsModule, "checkBatchJobAssets").mockResolvedValue({
			ok: false,
			code: "horizontal_cover_assets_missing",
			message: "missing horizontal covers: /tmp/item-a-4x3.png",
		});
		const applySpy = jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockResolvedValue({ ok: true });

		const result = await applyUploadThenFillAllTabs("/tmp/job.json", "req-1", 10, BATCH_PLATFORM_SCOPE_ALL, {
			submitHorizontalCover: true,
		});

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.message).toContain("/tmp/item-a-4x3.png");
		expect(applySpy).not.toHaveBeenCalled();
	});

	it("threads includeHorizontalCover to slot apply when enabled", async () => {
		jest.spyOn(checkAssetsModule, "checkBatchJobAssets").mockResolvedValue({ ok: true });
		const applySpy = jest
			.spyOn(batchSlotsModule, "applyBatchSlotsConcurrentByPlatform")
			.mockResolvedValue({ ok: true });

		const result = await applyUploadThenFillAllTabs("/tmp/job.json", "req-1", 10, BATCH_PLATFORM_SCOPE_ALL, {
			submitHorizontalCover: true,
		});

		expect(result.ok).toBe(true);
		expect(applySpy).toHaveBeenCalledWith(
			"/tmp/job.json",
			expect.any(String),
			"req-1",
			SLOTS,
			expect.objectContaining({ includeHorizontalCover: true }),
		);
	});
});
