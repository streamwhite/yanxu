import { Platform } from "@auto-upload/domain";
import { openPlatformUploadTabs } from "../../extension/src/sw/open-platform-upload-tabs";
import * as inspectModule from "../../extension/src/sw/inspect-job-file-outline";

describe("openPlatformUploadTabs", () => {
	const createMock = jest.fn();

	beforeEach(() => {
		createMock.mockReset();
		(globalThis as { chrome?: unknown }).chrome = {
			tabs: { create: createMock },
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("opens one tab per job item targeting the platform", async () => {
		jest.spyOn(inspectModule, "inspectJobFileOutline").mockResolvedValue({
			ok: true,
			outline: {
				jobVersion: 3,
				items: [
					{ itemIndex: 0, targets: ["bilibili", "douyin"] },
					{ itemIndex: 1, targets: ["bilibili"] },
				],
			},
		});

		const result = await openPlatformUploadTabs("/tmp/batch.job.json", Platform.Bilibili);

		expect(result.ok).toBe(true);
		expect(createMock).toHaveBeenCalledTimes(2);
		expect(createMock.mock.calls[0]?.[0]?.url).toContain("member.bilibili.com");
	});

	it("returns error when job has no items for platform", async () => {
		jest.spyOn(inspectModule, "inspectJobFileOutline").mockResolvedValue({
			ok: true,
			outline: {
				jobVersion: 3,
				items: [{ itemIndex: 0, targets: ["douyin"] }],
			},
		});

		const result = await openPlatformUploadTabs("/tmp/batch.job.json", Platform.Bilibili);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.code).toBe("no_platform_targets");
		expect(createMock).not.toHaveBeenCalled();
	});
});

describe("openAllPlatformUploadTabs", () => {
	const createMock = jest.fn();
	const reloadMock = jest.fn();

	beforeEach(() => {
		createMock.mockReset();
		reloadMock.mockReset();
		createMock.mockResolvedValue({ id: 1 });
		reloadMock.mockResolvedValue(undefined);
		(globalThis as { chrome?: unknown }).chrome = {
			tabs: { create: createMock, reload: reloadMock },
		};
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("opens tabs for every platform that has job items", async () => {
		jest.spyOn(inspectModule, "inspectJobFileOutline").mockResolvedValue({
			ok: true,
			outline: {
				jobVersion: 3,
				items: [
					{ itemIndex: 0, targets: ["bilibili", "douyin"] },
					{ itemIndex: 1, targets: ["channels"] },
				],
			},
		});

		const { openAllPlatformUploadTabs } = await import(
			"../../extension/src/sw/open-platform-upload-tabs"
		);
		const result = await openAllPlatformUploadTabs("/tmp/batch.job.json");

		expect(result.ok).toBe(true);
		expect(createMock).toHaveBeenCalledTimes(3);
		expect(reloadMock).toHaveBeenCalledTimes(1);
	});
});
