/**
 * @jest-environment jsdom
 */
import {
	findDouyinCoverDragMainText,
	waitForDouyinCoverDragMainText,
} from "../../extension/src/platforms/douyin/wait-for-douyin-cover-drag-main-text";

describe("waitForDouyinCoverDragMainText", () => {
	it("finds main text without requiring visibility", () => {
		document.body.innerHTML = `
			<div class="semi-upload-drag-area" style="display:none">
				<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
			</div>
		`;

		expect(findDouyinCoverDragMainText(document)?.textContent?.trim()).toBe(
			"点击上传文件或拖拽文件到这里",
		);
	});

	it("waits until drag main text appears", async () => {
		document.body.innerHTML = "";

		setTimeout(() => {
			document.body.innerHTML = `
				<div class="semi-upload-drag-area">
					<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
				</div>
			`;
		}, 30);

		await expect(waitForDouyinCoverDragMainText(document)).resolves.toBeTruthy();
	});
});
