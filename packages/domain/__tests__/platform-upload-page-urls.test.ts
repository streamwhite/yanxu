import { PLATFORM_UPLOAD_PAGE_URLS, Platform } from "@auto-upload/domain";

describe("platform upload page URLs", () => {
	it("defines a canonical upload URL per platform", () => {
		expect(PLATFORM_UPLOAD_PAGE_URLS[Platform.Bilibili]).toContain("member.bilibili.com");
		expect(PLATFORM_UPLOAD_PAGE_URLS[Platform.Douyin]).toContain("creator.douyin.com");
		expect(PLATFORM_UPLOAD_PAGE_URLS[Platform.Channels]).toContain("channels.weixin.qq.com");
	});
});
