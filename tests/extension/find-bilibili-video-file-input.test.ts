/**
 * @jest-environment jsdom
 */
import { findBilibiliVideoFileInput } from "../../extension/src/platforms/bilibili/find-bilibili-video-file-input";

describe("findBilibiliVideoFileInput", () => {
	it("prefers video input inside video upload area", () => {
		document.body.innerHTML = `
			<input type="file" accept="image/png" />
			<div class="upload-area">
				<span class="upload-text">点击上传或将视频拖拽到此区域</span>
				<input type="file" accept="video/mp4" />
			</div>
		`;

		const input = findBilibiliVideoFileInput(document);
		expect(input?.accept).toContain("video");
		expect(input?.closest(".upload-area")?.textContent).toContain("点击上传");
	});
});
