import {
	detectPlatformFromUrl,
	isAllowedPlatformUrl,
	Platform,
	scorePlatformUploadUrl,
} from "@yanxu/domain";

describe("platform URL helpers", () => {
	it("detects douyin creator URL", () => {
		expect(detectPlatformFromUrl("https://creator.douyin.com/creator-micro/content/upload")).toBe(
			Platform.Douyin,
		);
	});

	it("detects channels URL", () => {
		expect(detectPlatformFromUrl("https://channels.weixin.qq.com/platform/post/create")).toBe(
			Platform.Channels,
		);
	});

	it("allows bilibili member upload", () => {
		expect(
			isAllowedPlatformUrl(
				"https://member.bilibili.com/platform/upload/video/frame",
				Platform.Bilibili,
			),
		).toBe(true);
	});

	it("scores bilibili member video upload above home", () => {
		const uploadScore = scorePlatformUploadUrl(
			"https://member.bilibili.com/platform/upload/video/frame",
			Platform.Bilibili,
		);
		const homeScore = scorePlatformUploadUrl("https://www.bilibili.com/", Platform.Bilibili);
		expect(uploadScore).toBeGreaterThan(homeScore);
	});

	it("scores douyin upload URL above creator home", () => {
		const uploadScore = scorePlatformUploadUrl(
			"https://creator.douyin.com/creator-micro/content/upload",
			Platform.Douyin,
		);
		const homeScore = scorePlatformUploadUrl("https://creator.douyin.com/", Platform.Douyin);
		expect(uploadScore).toBeGreaterThan(homeScore);
	});

	it("scores douyin post-video page after upload", () => {
		const postVideoScore = scorePlatformUploadUrl(
			"https://creator.douyin.com/creator-micro/content/post/video?enter_from=publish_page",
			Platform.Douyin,
		);
		expect(postVideoScore).toBeGreaterThan(0);
	});
});
