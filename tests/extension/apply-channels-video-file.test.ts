/**
 * @jest-environment jsdom
 */
import { applyChannelsVideoFile } from "../../extension/src/platforms/channels/apply-channels-video-file";

describe("applyChannelsVideoFile", () => {
	it("assigns via drag-drop when file input is sibling of upload-content", async () => {
		document.body.innerHTML = `
			<div class="upload-content">
				<div class="center"><span class="add-icon"></span></div>
				<div class="upload-tip"><span>上传时长8小时内，MP4/H.264格式</span></div>
			</div>
			<input type="file" accept="" />
		`;

		const file = new File(["x"], "clip.mp4", { type: "video/mp4" });
		await expect(applyChannelsVideoFile(file)).resolves.toBe(true);
	});
});
