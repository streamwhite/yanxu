import { Platform } from "@auto-upload/domain";
import { listPlatformUploadTabsForPlatform } from "../../extension/src/sw/list-platform-upload-tabs-for-platform";
import type { PlatformUploadTab } from "../../extension/src/sw/query-platform-upload-tabs";

function tab(
	platform: PlatformUploadTab["platform"],
	tabId: number,
	url: string,
): PlatformUploadTab {
	return { platform, tabId, url };
}

describe("listPlatformUploadTabsForPlatform", () => {
	it("ignores non-upload bilibili tabs and keeps upload pages only", () => {
		const tabs = [
			tab(Platform.Bilibili, 1, "https://www.bilibili.com/"),
			tab(Platform.Bilibili, 2, "https://member.bilibili.com/platform/upload/video/frame"),
			tab(Platform.Bilibili, 3, "https://member.bilibili.com/platform/upload/video/frame"),
		];

		expect(listPlatformUploadTabsForPlatform(tabs, Platform.Bilibili).map((t) => t.tabId)).toEqual([
			2, 3,
		]);
	});

	it("counts douyin post-video tabs after upload navigates away from upload page", () => {
		const tabs = [
			tab(
				Platform.Douyin,
				10,
				"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
			),
			tab(
				Platform.Douyin,
				20,
				"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
			),
			tab(Platform.Douyin, 30, "https://creator.douyin.com/creator-micro/home"),
		];

		expect(listPlatformUploadTabsForPlatform(tabs, Platform.Douyin).map((t) => t.tabId)).toEqual([
			10, 20,
		]);
	});

	it("keeps stable ordering by tab id when douyin tabs have mixed upload urls", () => {
		const tabs = [
			tab(
				Platform.Douyin,
				30,
				"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
			),
			tab(Platform.Douyin, 10, "https://creator.douyin.com/creator-micro/content/upload"),
			tab(
				Platform.Douyin,
				20,
				"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
			),
		];

		expect(listPlatformUploadTabsForPlatform(tabs, Platform.Douyin).map((t) => t.tabId)).toEqual([
			10, 20, 30,
		]);
	});

	it("orders channels upload tabs by tab id", () => {
		const tabs = [
			tab(Platform.Channels, 40, "https://channels.weixin.qq.com/platform/post/create"),
			tab(Platform.Channels, 12, "https://channels.weixin.qq.com/platform/post/create"),
		];

		expect(listPlatformUploadTabsForPlatform(tabs, Platform.Channels).map((t) => t.tabId)).toEqual([
			12, 40,
		]);
	});
});
