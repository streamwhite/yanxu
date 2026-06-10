/**
 * @jest-environment jsdom
 */
import { channelsHasPostUploadMetadataUi } from "../../extension/src/platforms/channels/channels-has-post-upload-metadata-ui";
import { channelsVideoUploadLooksStarted } from "../../extension/src/platforms/channels/channels-video-upload-looks-started";

describe("channelsHasPostUploadMetadataUi", () => {
	it("does not treat cover wraps alone on the create page as post-upload", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="center"><span class="add-icon"></span></div>
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
			</div>
			<div class="vertical-cover-wrap img-popover-wrap"></div>
		`;

		expect(channelsHasPostUploadMetadataUi(document)).toBe(false);
		expect(channelsVideoUploadLooksStarted(document)).toBe(false);
	});

	it("detects cover wraps after video preview is present", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
				<video src="blob:test"></video>
			</div>
			<div class="vertical-cover-wrap img-popover-wrap"></div>
		`;

		expect(channelsHasPostUploadMetadataUi(document)).toBe(true);
		expect(channelsVideoUploadLooksStarted(document)).toBe(true);
	});
});
