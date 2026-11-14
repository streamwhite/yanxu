import { Platform } from "@yanxu/domain";
import { openPlatformUploadTabs } from "../../extension/src/sw/open-platform-upload-tabs";
import * as inspectModule from "../../extension/src/sw/inspect-job-file-outline";
import * as waitMsModule from "../../extension/src/content/wait-ms";

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
		jest.spyOn(waitMsModule, "waitMs").mockResolvedValue(undefined);
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

	it("opens only bilibili tabs when bilibili scope is selected", async () => {
		jest.spyOn(inspectModule, "inspectJobFileOutline").mockResolvedValue({
			ok: true,
			outline: {
				jobVersion: 3,
				items: [
					{ itemIndex: 0, targets: ["bilibili", "douyin", "channels"] },
					{ itemIndex: 1, targets: ["bilibili", "douyin"] },
				],
			},
		});

		const { openAllPlatformUploadTabs } = await import(
			"../../extension/src/sw/open-platform-upload-tabs"
		);
		const { Platform } = await import("@yanxu/domain");
		const result = await openAllPlatformUploadTabs("/tmp/batch.job.json", Platform.Bilibili);

		expect(result.ok).toBe(true);
		expect(createMock).toHaveBeenCalledTimes(2);
		expect(
			createMock.mock.calls.every(([args]) => args.url.includes("member.bilibili.com")),
		).toBe(true);
	});

	it("opens only channels tabs when channels scope is selected", async () => {
		jest.spyOn(inspectModule, "inspectJobFileOutline").mockResolvedValue({
			ok: true,
			outline: {
				jobVersion: 3,
				items: [
					{ itemIndex: 0, targets: ["bilibili", "douyin", "channels"] },
					{ itemIndex: 1, targets: ["bilibili", "douyin"] },
				],
			},
		});

		const { openAllPlatformUploadTabs } = await import(
			"../../extension/src/sw/open-platform-upload-tabs"
		);
		const { Platform } = await import("@yanxu/domain");
		const result = await openAllPlatformUploadTabs("/tmp/batch.job.json", Platform.Channels);

		expect(result.ok).toBe(true);
		expect(createMock).toHaveBeenCalledTimes(1);
		expect(
			createMock.mock.calls.every(([args]) => args.url.includes("channels.weixin.qq.com")),
		).toBe(true);
		expect(reloadMock).toHaveBeenCalledTimes(1);
	});
});
