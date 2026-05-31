/**
 * @jest-environment jsdom
 */
import { findChannelsVideoFileInput } from "../../extension/src/platforms/channels/find-channels-video-file-input";

describe("findChannelsVideoFileInput", () => {
	it("finds video input sibling to upload-content", () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="upload-tip"><span>MP4/H.264</span></div>
			</div>
			<input type="file" accept="video/mp4" style="display:none" />
		`;

		const input = findChannelsVideoFileInput(document);
		expect(input?.accept).toContain("video");
	});
});
