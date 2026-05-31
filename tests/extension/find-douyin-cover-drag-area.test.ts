/**
 * @jest-environment jsdom
 */
import { findDouyinCoverDragArea } from "../../extension/src/platforms/douyin/find-douyin-cover-drag-area";
import { findDouyinCoverModalBody } from "../../extension/src/platforms/douyin/find-douyin-cover-modal-body";
import { findDouyinCoverUploadClickTarget } from "../../extension/src/platforms/douyin/find-douyin-cover-upload-click-target";

describe("findDouyinCoverDragArea", () => {
	it("finds drag area and main text inside creator modal", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area semi-upload-drag-area-custom">
						<div class="semi-upload-drag-area-text">
							<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
						</div>
					</div>
					<input type="file" accept="image/png" />
				</div>
			</div>
		`;

		const modal = findDouyinCoverModalBody(document);
		const dragArea = findDouyinCoverDragArea(modal ?? document);
		expect(dragArea?.className).toContain("semi-upload-drag-area");

		const clickTarget = findDouyinCoverUploadClickTarget(modal ?? document);
		expect(clickTarget?.className).toContain("semi-upload-drag-area-main-text");
	});
});
