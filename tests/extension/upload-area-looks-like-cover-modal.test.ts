/**
 * @jest-environment jsdom
 */
import { uploadAreaLooksLikeCoverModal } from "../../extension/src/content/upload-area-looks-like-cover-modal";

describe("uploadAreaLooksLikeCoverModal", () => {
	it("rejects video drag upload area", () => {
		document.body.innerHTML = `
			<div class="upload-area">
				<span class="upload-text">点击上传或将视频拖拽到此区域</span>
			</div>
		`;

		const area = document.querySelector(".upload-area");
		expect(area instanceof HTMLElement && uploadAreaLooksLikeCoverModal(area)).toBe(false);
	});

	it("accepts cover modal upload area", () => {
		document.body.innerHTML = `
			<div class="upload-area">
				<span class="upload-text">上传封面</span>
				<span class="sub-text">拖拽图片或点击上传</span>
			</div>
		`;

		const area = document.querySelector(".upload-area");
		expect(area instanceof HTMLElement && uploadAreaLooksLikeCoverModal(area)).toBe(true);
	});
});
