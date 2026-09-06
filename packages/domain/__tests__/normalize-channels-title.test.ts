import { normalizeChannelsTitle } from "@auto-upload/domain";

describe("normalizeChannelsTitle", () => {
	it("replaces dot with 点 for wechat title fill", () => {
		expect(normalizeChannelsTitle("MiniMax豪募160.4亿港元")).toBe(
			"MiniMax豪募160点4亿港元",
		);
	});

	it("leaves titles without dots unchanged", () => {
		expect(normalizeChannelsTitle("plain title")).toBe("plain title");
	});
});
