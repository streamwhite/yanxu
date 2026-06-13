import { Platform } from "@auto-upload/domain";
import { submitPlatformTabs } from "../../extension/src/sw/submit-platform-tabs";
import * as queryModule from "../../extension/src/sw/query-platform-upload-tabs";
import * as sendSubmitModule from "../../extension/src/sw/send-submit-to-tab";
import * as activateModule from "../../extension/src/sw/activate-tab-for-apply";
import * as staggerModule from "../../extension/src/sw/wait-random-stagger-ms";

describe("submitPlatformTabs", () => {
	beforeEach(() => {
		jest.spyOn(staggerModule, "waitRandomStaggerMs").mockResolvedValue(undefined);
		jest.spyOn(activateModule, "activateChannelsTabForApply").mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("clicks submit on every platform tab", async () => {
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
		const sendSubmit = jest.spyOn(sendSubmitModule, "sendSubmitToTab").mockResolvedValue(undefined);

		const result = await submitPlatformTabs(Platform.Douyin);

		expect(result).toEqual({ ok: true });
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
