import { Platform } from "@auto-upload/domain";
import { buildBatchApplySlots } from "../../extension/src/sw/build-batch-apply-slots";
import type { PlatformUploadTab } from "../../extension/src/sw/query-platform-upload-tabs";

const UPLOAD_URL_BY_PLATFORM: Record<PlatformUploadTab["platform"], string> = {
	[Platform.Bilibili]: "https://member.bilibili.com/platform/upload/video/frame",
	[Platform.Douyin]: "https://creator.douyin.com/creator-micro/content/upload",
	[Platform.Channels]: "https://channels.weixin.qq.com/platform/post/create",
};

function tab(platform: PlatformUploadTab["platform"], tabId: number): PlatformUploadTab {
	return { platform, tabId, url: UPLOAD_URL_BY_PLATFORM[platform] };
}

describe("buildBatchApplySlots", () => {
	const outline = {
		items: [
			{ itemIndex: 0, targets: ["bilibili", "douyin"] },
			{ itemIndex: 1, targets: ["douyin", "channels"] },
		],
	};

	it("maps each platform tab to the correct batch item index", () => {
		const tabsByPlatform = new Map([
			[Platform.Bilibili, [tab(Platform.Bilibili, 10)]],
			[Platform.Douyin, [tab(Platform.Douyin, 20), tab(Platform.Douyin, 21)]],
			[Platform.Channels, [tab(Platform.Channels, 30)]],
		]);

		const slots = buildBatchApplySlots(outline, tabsByPlatform);

		expect(slots).toEqual([
			{ platform: Platform.Bilibili, tabId: 10, itemIndex: 0 },
			{ platform: Platform.Douyin, tabId: 20, itemIndex: 0 },
			{ platform: Platform.Douyin, tabId: 21, itemIndex: 1 },
			{ platform: Platform.Channels, tabId: 30, itemIndex: 1 },
		]);
	});

	it("maps two job items to two tabs when both target the same platform", () => {
		const twoDouyinItems = {
			items: [
				{ itemIndex: 0, targets: ["douyin"] },
				{ itemIndex: 1, targets: ["douyin"] },
			],
		};
		const tabsByPlatform = new Map([
			[Platform.Douyin, [tab(Platform.Douyin, 100), tab(Platform.Douyin, 101)]],
		]);

		expect(buildBatchApplySlots(twoDouyinItems, tabsByPlatform)).toEqual([
			{ platform: Platform.Douyin, tabId: 100, itemIndex: 0 },
			{ platform: Platform.Douyin, tabId: 101, itemIndex: 1 },
		]);
	});

	it("maps two bilibili and two channels items to separate tabs", () => {
		const outline = {
			items: [
				{ itemIndex: 0, targets: ["bilibili", "channels"] },
				{ itemIndex: 1, targets: ["bilibili", "channels"] },
			],
		};
		const tabsByPlatform = new Map([
			[Platform.Bilibili, [tab(Platform.Bilibili, 10), tab(Platform.Bilibili, 11)]],
			[Platform.Channels, [tab(Platform.Channels, 20), tab(Platform.Channels, 21)]],
		]);

		expect(buildBatchApplySlots(outline, tabsByPlatform)).toEqual([
			{ platform: Platform.Bilibili, tabId: 10, itemIndex: 0 },
			{ platform: Platform.Bilibili, tabId: 11, itemIndex: 1 },
			{ platform: Platform.Channels, tabId: 20, itemIndex: 0 },
			{ platform: Platform.Channels, tabId: 21, itemIndex: 1 },
		]);
	});
});
