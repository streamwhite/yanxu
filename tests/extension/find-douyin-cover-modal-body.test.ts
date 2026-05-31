/**
 * @jest-environment jsdom
 */
import { findDouyinCoverModalBody } from "../../extension/src/platforms/douyin/find-douyin-cover-modal-body";
import { findDouyinCoverUploadClickTarget } from "../../extension/src/platforms/douyin/find-douyin-cover-upload-click-target";

describe("findDouyinCoverModalBody", () => {
	it("finds creator modal body", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
				</div>
			</div>
		`;

		const modal = findDouyinCoverModalBody(document);
		expect(modal?.id).toBe("dy-creator-content-modal-body");

		const clickTarget = findDouyinCoverUploadClickTarget(modal ?? document);
		expect(clickTarget?.className).toContain("semi-upload-drag-area-main-text");
	});
});
