/**
 * @jest-environment jsdom
 */
import { findDouyinCoverDragArea } from "../../extension/src/platforms/douyin/find-douyin-cover-drag-area";
import { resolveDouyinCoverDragArea } from "../../extension/src/platforms/douyin/resolve-douyin-cover-drag-area";
import { findDouyinCoverDragMainText } from "../../extension/src/platforms/douyin/wait-for-douyin-cover-drag-main-text";

describe("resolveDouyinCoverDragArea", () => {
	it("resolves drag area from main text via closest", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload">
					<div class="semi-upload-drag-area" style="width:0;height:0;overflow:hidden">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
				</div>
			</div>
		`;

		const modal = document.getElementById("dy-creator-content-modal-body");
		const mainText = findDouyinCoverDragMainText(modal ?? document);
		expect(mainText).not.toBeNull();

		expect(findDouyinCoverDragArea(modal ?? document)?.className).toContain(
			"semi-upload-drag-area",
		);

		const dragArea = resolveDouyinCoverDragArea(modal ?? document, mainText);
		expect(dragArea?.className).toContain("semi-upload-drag-area");
	});
});
