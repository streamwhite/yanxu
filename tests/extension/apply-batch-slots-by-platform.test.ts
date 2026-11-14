import { ApplyPhase, Platform } from "@yanxu/domain";
import { applyBatchSlotsConcurrentByPlatform } from "../../extension/src/sw/apply-batch-slots-by-platform";
import * as progressModule from "../../extension/src/shared/batch-progress-store";
import * as applyItemModule from "../../extension/src/sw/apply-batch-item-via-native-host";
import * as staggerModule from "../../extension/src/sw/wait-random-stagger-ms";
import * as activateModule from "../../extension/src/sw/activate-tab-for-apply";
import * as rateLimitModule from "../../extension/src/sw/upload-rate-limit";

describe("applyBatchSlotsConcurrentByPlatform", () => {
	beforeEach(() => {
		jest.restoreAllMocks();
		jest.spyOn(activateModule, "activateChannelsTabForApply").mockResolvedValue();
		jest.spyOn(rateLimitModule, "acquireVideoUploadPermit").mockResolvedValue({
			allowed: true,
		});
	});

	it("checks the daily upload quota before sending a video", async () => {
		const permitSpy = jest
			.spyOn(rateLimitModule, "acquireVideoUploadPermit")
			.mockResolvedValue({ allowed: false, retryAt: 123_000 });
		const applySpy = jest
			.spyOn(applyItemModule, "applyBatchItemViaNativeHost")
			.mockResolvedValue({ ok: true });
		jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-limit",
			[{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 }],
		);

		expect(permitSpy).toHaveBeenCalledWith(Platform.Bilibili);
		expect(applySpy).not.toHaveBeenCalled();
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.message).toContain("30");
	});

	it("applies all slots on one platform concurrently after stagger", async () => {
		const applySpy = jest.spyOn(applyItemModule, "applyBatchItemViaNativeHost").mockResolvedValue({
			ok: true,
		});
		const staggerSpy = jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const slots = [
			{ platform: "bilibili" as const, tabId: 1, itemIndex: 0 },
			{ platform: "bilibili" as const, tabId: 2, itemIndex: 1 },
		];

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-1",
			slots,
		);

		expect(result.ok).toBe(true);
		expect(staggerSpy).toHaveBeenCalledTimes(2);
		expect(applySpy).toHaveBeenCalledTimes(2);
	});

	it("applies bilibili slots sequentially", async () => {
		const applySpy = jest.spyOn(applyItemModule, "applyBatchItemViaNativeHost").mockResolvedValue({
			ok: true,
		});
		const staggerSpy = jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const slots = [
			{ platform: "bilibili" as const, tabId: 1, itemIndex: 0 },
			{ platform: "bilibili" as const, tabId: 2, itemIndex: 1 },
		];

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.Full,
			"req-bili",
			slots,
		);

		expect(result.ok).toBe(true);
		expect(applySpy).toHaveBeenCalledTimes(2);
		const firstCallOrder = applySpy.mock.invocationCallOrder[0] ?? 0;
		const secondCallOrder = applySpy.mock.invocationCallOrder[1] ?? 0;
		expect(firstCallOrder).toBeLessThan(secondCallOrder);
		expect(staggerSpy).toHaveBeenCalledTimes(2);
	});

	it("applies channels slots sequentially", async () => {
		const applySpy = jest.spyOn(applyItemModule, "applyBatchItemViaNativeHost").mockResolvedValue({
			ok: true,
		});
		const staggerSpy = jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const slots = [
			{ platform: "channels" as const, tabId: 10, itemIndex: 0 },
			{ platform: "channels" as const, tabId: 11, itemIndex: 1 },
		];

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-ch",
			slots,
		);

		expect(result.ok).toBe(true);
		expect(applySpy).toHaveBeenCalledTimes(2);
		const firstCallOrder = applySpy.mock.invocationCallOrder[0] ?? 0;
		const secondCallOrder = applySpy.mock.invocationCallOrder[1] ?? 0;
		expect(firstCallOrder).toBeLessThan(secondCallOrder);
		expect(staggerSpy).toHaveBeenCalledTimes(2);
	});

	it("applies channels after other platforms so the tab stays focused", async () => {
		const order: string[] = [];
		jest.spyOn(applyItemModule, "applyBatchItemViaNativeHost").mockImplementation(async (input) => {
			order.push(input.platform);
			return { ok: true };
		});
		jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const slots = [
			{ platform: Platform.Bilibili, tabId: 1, itemIndex: 0 },
			{ platform: Platform.Channels, tabId: 2, itemIndex: 0 },
		];

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.VideoOnly,
			"req-mix",
			slots,
		);

		expect(result.ok).toBe(true);
		expect(order).toEqual([Platform.Bilibili, Platform.Channels]);
	});

	it("runs every slot even when one tab fails", async () => {
		const applySpy = jest
			.spyOn(applyItemModule, "applyBatchItemViaNativeHost")
			.mockResolvedValueOnce({
				ok: false,
				code: "tab_apply_failed",
				message: "page_fields_not_found:分区 → 科技数码",
			})
			.mockResolvedValueOnce({ ok: true });
		jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue();
		jest.spyOn(progressModule, "appendBatchProgress").mockResolvedValue();

		const slots = [
			{ platform: "bilibili" as const, tabId: 1, itemIndex: 0 },
			{ platform: "bilibili" as const, tabId: 2, itemIndex: 1 },
		];

		const result = await applyBatchSlotsConcurrentByPlatform(
			"/tmp/job.json",
			ApplyPhase.FieldsOnly,
			"req-2",
			slots,
		);

		expect(applySpy).toHaveBeenCalledTimes(2);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.code).toBe("batch_partial_failed");
	});
});
