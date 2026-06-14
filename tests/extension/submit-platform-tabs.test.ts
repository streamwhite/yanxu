import { Platform } from "@auto-upload/domain";
import { submitPlatformTabs } from "../../extension/src/sw/submit-platform-tabs";
import * as queryModule from "../../extension/src/sw/query-platform-upload-tabs";
import * as sendSubmitModule from "../../extension/src/sw/send-submit-to-tab";
import * as activateSubmitModule from "../../extension/src/sw/activate-tab-for-submit";
import * as staggerModule from "../../extension/src/sw/wait-random-stagger-ms";

describe("submitPlatformTabs", () => {
	beforeEach(() => {
		jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue(undefined);
		jest.spyOn(activateSubmitModule, "activateTabForSubmit").mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("activates and clicks submit on every bilibili tab", async () => {
		jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([
			{
				platform: Platform.Bilibili,
				tabId: 20,
				url: "https://member.bilibili.com/platform/upload/video/frame",
			},
			{
				platform: Platform.Bilibili,
				tabId: 21,
				url: "https://member.bilibili.com/platform/upload/video/frame",
			},
		]);
		const activate = jest
			.spyOn(activateSubmitModule, "activateTabForSubmit")
			.mockResolvedValue(undefined);
		const sendSubmit = jest.spyOn(sendSubmitModule, "sendSubmitToTab").mockResolvedValue(undefined);

		const result = await submitPlatformTabs(Platform.Bilibili);

		expect(result).toEqual({ ok: true });
		expect(activate).toHaveBeenCalledTimes(2);
		expect(activate).toHaveBeenNthCalledWith(1, 20, Platform.Bilibili);
		expect(activate).toHaveBeenNthCalledWith(2, 21, Platform.Bilibili);
		expect(sendSubmit).toHaveBeenCalledTimes(2);
		expect(sendSubmit).toHaveBeenNthCalledWith(1, 20, Platform.Bilibili);
		expect(sendSubmit).toHaveBeenNthCalledWith(2, 21, Platform.Bilibili);
	});

	it("activates and clicks submit on every douyin tab", async () => {
		jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([
			{
				platform: Platform.Douyin,
				tabId: 10,
				url: "https://creator.douyin.com/creator-micro/content/post/video",
			},
			{
				platform: Platform.Douyin,
				tabId: 11,
				url: "https://creator.douyin.com/creator-micro/content/post/video",
			},
		]);
		const activate = jest
			.spyOn(activateSubmitModule, "activateTabForSubmit")
			.mockResolvedValue(undefined);
		const sendSubmit = jest.spyOn(sendSubmitModule, "sendSubmitToTab").mockResolvedValue(undefined);

		const result = await submitPlatformTabs(Platform.Douyin);

		expect(result).toEqual({ ok: true });
		expect(activate).toHaveBeenCalledTimes(2);
		expect(activate).toHaveBeenNthCalledWith(1, 10, Platform.Douyin);
		expect(activate).toHaveBeenNthCalledWith(2, 11, Platform.Douyin);
		expect(sendSubmit).toHaveBeenCalledTimes(2);
		expect(sendSubmit).toHaveBeenNthCalledWith(1, 10, Platform.Douyin);
		expect(sendSubmit).toHaveBeenNthCalledWith(2, 11, Platform.Douyin);
	});

	it("returns error when no tabs exist for platform", async () => {
		jest.spyOn(queryModule, "queryPlatformUploadTabs").mockResolvedValue([]);

		const result = await submitPlatformTabs(Platform.Bilibili);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.code).toBe("no_platform_tabs");
	});
});
