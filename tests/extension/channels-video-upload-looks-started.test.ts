/**
 * @jest-environment jsdom
 */
import { channelsVideoUploadLooksStarted } from "../../extension/src/platforms/channels/channels-video-upload-looks-started";

describe("channelsVideoUploadLooksStarted", () => {
	it("returns true when upload area no longer shows add icon", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
				<video src="blob:test"></video>
			</div>
		`;

		expect(channelsVideoUploadLooksStarted(document)).toBe(true);
	});
});
