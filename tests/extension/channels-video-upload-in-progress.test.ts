/**
 * @jest-environment jsdom
 */
import { channelsVideoUploadInProgress } from "../../extension/src/platforms/channels/channels-video-upload-in-progress";

describe("channelsVideoUploadInProgress", () => {
	it("returns true when upload busy hint is visible", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
				<span>文件上传中，请等待完成后再编辑</span>
			</div>
		`;

		expect(channelsVideoUploadInProgress(document)).toBe(true);
	});

	it("returns false when only the empty picker is shown", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="center"><span class="add-icon"></span></div>
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
			</div>
		`;

		expect(channelsVideoUploadInProgress(document)).toBe(false);
	});
});
