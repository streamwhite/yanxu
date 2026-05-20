import { isAllowedBilibiliMatchUrl } from "@auto-upload/domain";

describe("isAllowedBilibiliMatchUrl", () => {
	it("allows member upload pages", () => {
		expect(
			isAllowedBilibiliMatchUrl("https://member.bilibili.com/platform/upload/video/frame"),
		).toBe(true);
	});

	it("rejects http", () => {
		expect(isAllowedBilibiliMatchUrl("http://member.bilibili.com/")).toBe(false);
	});
});
