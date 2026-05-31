/**
 * @jest-environment jsdom
 */
import { Platform } from "@auto-upload/domain";
import { findCoverModalUploadArea } from "../../extension/src/content/find-cover-modal-upload-area";

describe("findCoverModalUploadArea", () => {
	it("ignores video upload area and picks cover modal area", () => {
		document.body.innerHTML = `
			<div class="upload-area">
				<span class="upload-text">点击上传或将视频拖拽到此区域</span>
			</div>
			<div class="upload-area">
				<span class="upload-text">上传封面</span>
			</div>
		`;

		const found = findCoverModalUploadArea(document, Platform.Bilibili);
		expect(found?.querySelector(".upload-text")?.textContent?.trim()).toBe("上传封面");
	});
});
