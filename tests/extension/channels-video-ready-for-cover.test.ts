/**
 * @jest-environment jsdom
 */
import { channelsVideoReadyForCover } from "../../extension/src/platforms/channels/channels-video-ready-for-cover";

describe("channelsVideoReadyForCover", () => {
	it("returns true when metadata fields exist and upload is not busy", () => {
		document.body.innerHTML = `
			<input class="weui-desktop-form__input" placeholder="标题" />
			<div class="vertical-cover-wrap img-popover-wrap"></div>
		`;

		expect(channelsVideoReadyForCover(document)).toBe(true);
	});

	it("returns false while upload busy text is shown", () => {
		document.body.innerHTML = `
			<input class="weui-desktop-form__input" placeholder="标题" />
			<span>文件上传中，请等待完成后再编辑</span>
		`;

		expect(channelsVideoReadyForCover(document)).toBe(false);
	});
});
