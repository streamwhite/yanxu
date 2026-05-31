/**
 * @jest-environment jsdom
 */
import {
	channelsCoverWrapLooksUserUploaded,
	isChannelsAutoVideoFrameCoverImg,
} from "../../extension/src/platforms/channels/channels-cover-upload-looks-applied";

describe("channels cover user-upload detection", () => {
	it("does not treat auto video frame CDN thumbnails as user-uploaded cover", () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<img src="https://finder.video.qq.com/stodownload?token=abc" width="120" height="160" />
			</div>
		`;

		const img = document.querySelector("img");
		if (!(img instanceof HTMLImageElement)) throw new Error("missing img");

		expect(isChannelsAutoVideoFrameCoverImg(img)).toBe(true);
		expect(channelsCoverWrapLooksUserUploaded(document, ".vertical-cover-wrap")).toBe(false);
	});

	it("treats blob preview as user-uploaded cover", () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<img src="blob:custom-cover" width="120" height="160" />
			</div>
		`;

		expect(channelsCoverWrapLooksUserUploaded(document, ".vertical-cover-wrap")).toBe(true);
	});
});
