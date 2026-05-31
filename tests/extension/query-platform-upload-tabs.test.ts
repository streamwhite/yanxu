import { Platform } from "@auto-upload/domain";
import { queryPlatformUploadTabs } from "../../extension/src/sw/query-platform-upload-tabs";

describe("queryPlatformUploadTabs", () => {
	const queryMock = jest.fn();

	beforeEach(() => {
		queryMock.mockReset();
		(globalThis as { chrome?: unknown }).chrome = {
			tabs: { query: queryMock },
		};
	});

	it("queries all browser windows, not only the current window", async () => {
		queryMock.mockResolvedValue([]);

		await queryPlatformUploadTabs();

		expect(queryMock).toHaveBeenCalledWith({});
	});

	it("includes upload tabs from any window", async () => {
		queryMock.mockResolvedValue([
			{
				id: 11,
				url: "https://member.bilibili.com/platform/upload/video/frame",
				windowId: 1,
			},
			{
				id: 22,
				url: "https://creator.douyin.com/creator-micro/content/upload",
				windowId: 2,
			},
			{
				id: 33,
				url: "https://channels.weixin.qq.com/platform/post/create",
				windowId: 3,
			},
		]);

		const tabs = await queryPlatformUploadTabs();

		expect(tabs).toEqual([
			{
				tabId: 11,
				url: "https://member.bilibili.com/platform/upload/video/frame",
				platform: Platform.Bilibili,
			},
			{
				tabId: 22,
				url: "https://creator.douyin.com/creator-micro/content/upload",
				platform: Platform.Douyin,
			},
			{
				tabId: 33,
				url: "https://channels.weixin.qq.com/platform/post/create",
				platform: Platform.Channels,
			},
		]);
	});

	it("uses pendingUrl while a tab is still loading", async () => {
		queryMock.mockResolvedValue([
			{
				id: 44,
				url: "about:blank",
				pendingUrl: "https://creator.douyin.com/creator-micro/content/upload",
				windowId: 1,
			},
		]);

		const tabs = await queryPlatformUploadTabs();

		expect(tabs).toEqual([
			{
				tabId: 44,
				url: "https://creator.douyin.com/creator-micro/content/upload",
				platform: Platform.Douyin,
			},
		]);
	});
});
