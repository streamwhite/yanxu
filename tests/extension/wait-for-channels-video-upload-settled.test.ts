/**
 * @jest-environment jsdom
 */
import { waitForChannelsVideoUploadSettled } from "../../extension/src/platforms/channels/wait-for-channels-video-upload-settled";

describe("waitForChannelsVideoUploadSettled", () => {
	it("resolves when metadata fields appear after the upload picker is removed", async () => {
		document.body.innerHTML = `
			<input class="weui-desktop-form__input" type="text" placeholder="概括视频主要内容，字数建议6-16个字符" />
		`;

		await expect(waitForChannelsVideoUploadSettled(document)).resolves.toBe(true);
	});
});
