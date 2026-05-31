/**
 * @jest-environment jsdom
 */
import { channelsVideoAlreadyUploaded } from "../../extension/src/platforms/channels/channels-video-already-uploaded";
import { applyChannelsVideoFile } from "../../extension/src/platforms/channels/apply-channels-video-file";

describe("channelsVideoAlreadyUploaded", () => {
	it("is true when metadata fields are visible and the upload picker is gone", () => {
		document.body.innerHTML = `
			<input class="weui-desktop-form__input" type="text" placeholder="概括视频主要内容，字数建议6-16个字符" />
			<div class="post-desc-box">
				<div contenteditable="" data-placeholder="添加描述" class="input-editor"></div>
			</div>
		`;

		expect(channelsVideoAlreadyUploaded(document)).toBe(true);
	});
});

describe("applyChannelsVideoFile when video already present", () => {
	it("returns true without requiring the upload picker", async () => {
		document.body.innerHTML = `
			<input class="weui-desktop-form__input" type="text" placeholder="概括视频主要内容，字数建议6-16个字符" />
		`;

		const file = new File(["x"], "clip.mp4", { type: "video/mp4" });
		await expect(applyChannelsVideoFile(file)).resolves.toBe(true);
	});
});
