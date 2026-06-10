/**
 * @jest-environment jsdom
 */
import { channelsVideoUploadVerified } from "../../extension/src/platforms/channels/channels-video-upload-verified";

describe("channelsVideoUploadVerified", () => {
	it("returns false for empty create page with cover wraps only", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="center"><span class="add-icon"></span></div>
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
			</div>
			<div class="vertical-cover-wrap img-popover-wrap"></div>
		`;

		expect(channelsVideoUploadVerified(document)).toBe(false);
	});

	it("returns true when upload area contains a video preview and upload finished", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
				<video src="blob:test"></video>
			</div>
		`;

		expect(channelsVideoUploadVerified(document)).toBe(true);
	});

	it("returns false while server upload busy text is shown", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
				<video src="blob:test"></video>
			</div>
			<span>文件上传中，请等待完成后再编辑</span>
		`;

		expect(channelsVideoUploadVerified(document)).toBe(false);
	});
});
