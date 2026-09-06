import { Platform } from "@auto-upload/domain";
import { resolveBatchPlatformIds } from "../../extension/src/shared/batch-platform-scope";
import { validateBatchTabRequirements } from "../../extension/src/sw/validate-batch-tab-requirements";
import type { PlatformUploadTab } from "../../extension/src/sw/query-platform-upload-tabs";

function tab(
	platform: PlatformUploadTab["platform"],
	tabId: number,
	url: string,
): PlatformUploadTab {
	return { platform, tabId, url };
}

describe("validateBatchTabRequirements", () => {
	const outline = {
		items: [
			{ itemIndex: 0, targets: ["bilibili", "douyin"] },
			{ itemIndex: 1, targets: ["douyin", "channels"] },
		],
	};

	it("counts only upload-page tabs, not platform homepages", () => {
		const tabsByPlatform = new Map([
			[
				Platform.Bilibili,
				[
					tab(Platform.Bilibili, 1, "https://www.bilibili.com/"),
					tab(Platform.Bilibili, 2, "https://member.bilibili.com/platform/upload/video/frame"),
				],
			],
		]);
		const outline = {
			items: [
				{ itemIndex: 0, targets: ["bilibili"] },
				{ itemIndex: 1, targets: ["bilibili"] },
			],
		};

		const result = validateBatchTabRequirements(outline, tabsByPlatform);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.shortages[0]).toEqual({
			platform: Platform.Bilibili,
			required: 2,
			found: 1,
		});
	});

	it("reports shortages for bilibili, douyin, and channels before any upload", () => {
		const tabsByPlatform = new Map([
			[Platform.Bilibili, []],
			[
				Platform.Douyin,
				[tab(Platform.Douyin, 1, "https://creator.douyin.com/creator-micro/content/upload")],
			],
			[Platform.Channels, []],
		]);

		const result = validateBatchTabRequirements(outline, tabsByPlatform);
		expect(result.ok).toBe(false);
		if (result.ok) return;

		expect(result.shortages).toHaveLength(3);
		expect(result.shortages).toEqual(
			expect.arrayContaining([
				{ platform: Platform.Bilibili, required: 1, found: 0 },
				{ platform: Platform.Douyin, required: 2, found: 1 },
				{ platform: Platform.Channels, required: 1, found: 0 },
			]),
		);
	});

	it("passes when douyin tabs are on post-video page after upload", () => {
		const tabsByPlatform = new Map([
			[
				Platform.Bilibili,
				[tab(Platform.Bilibili, 1, "https://member.bilibili.com/platform/upload/video/frame")],
			],
			[
				Platform.Douyin,
				[
					tab(
						Platform.Douyin,
						2,
						"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
					),
					tab(
						Platform.Douyin,
						3,
						"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
					),
				],
			],
			[
				Platform.Channels,
				[tab(Platform.Channels, 4, "https://channels.weixin.qq.com/platform/post/create")],
			],
		]);

		expect(validateBatchTabRequirements(outline, tabsByPlatform)).toEqual({ ok: true });
	});

	it("passes when every platform has enough upload tabs", () => {
		const tabsByPlatform = new Map([
			[
				Platform.Bilibili,
				[tab(Platform.Bilibili, 1, "https://member.bilibili.com/platform/upload/video/frame")],
			],
			[
				Platform.Douyin,
				[
					tab(Platform.Douyin, 2, "https://creator.douyin.com/creator-micro/content/upload"),
					tab(Platform.Douyin, 3, "https://creator.douyin.com/creator-micro/content/upload"),
				],
			],
			[
				Platform.Channels,
				[tab(Platform.Channels, 4, "https://channels.weixin.qq.com/platform/post/create")],
			],
		]);

		expect(validateBatchTabRequirements(outline, tabsByPlatform)).toEqual({ ok: true });
	});

	it("ignores bilibili and douyin shortages when scoped to channels only", () => {
		const tabsByPlatform = new Map([
			[Platform.Bilibili, []],
			[Platform.Douyin, []],
			[
				Platform.Channels,
				[tab(Platform.Channels, 4, "https://channels.weixin.qq.com/platform/post/create")],
			],
		]);

		const result = validateBatchTabRequirements(
			outline,
			tabsByPlatform,
			resolveBatchPlatformIds(Platform.Channels),
		);

		expect(result).toEqual({ ok: true });
	});

	it("reports channels shortage when scoped to channels only", () => {
		const tabsByPlatform = new Map([
			[
				Platform.Bilibili,
				[tab(Platform.Bilibili, 1, "https://member.bilibili.com/platform/upload/video/frame")],
			],
			[
				Platform.Douyin,
				[
					tab(Platform.Douyin, 2, "https://creator.douyin.com/creator-micro/content/upload"),
					tab(Platform.Douyin, 3, "https://creator.douyin.com/creator-micro/content/upload"),
				],
			],
			[Platform.Channels, []],
		]);

		const result = validateBatchTabRequirements(
			outline,
			tabsByPlatform,
			resolveBatchPlatformIds(Platform.Channels),
		);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.shortages).toEqual([{ platform: Platform.Channels, required: 1, found: 0 }]);
	});
});
