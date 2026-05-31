/**
 * @jest-environment jsdom
 */
import { applyDouyinCoverViaModal } from "../../extension/src/platforms/douyin/apply-douyin-cover-via-modal";
import { assignFileToInput } from "../../extension/src/content/dom";
import { inputHasAnyFile } from "../../extension/src/content/input-has-any-file";
import { douyinCoverUploadLooksApplied } from "../../extension/src/platforms/douyin/douyin-cover-upload-looks-applied";
import { findDouyinCoverFileInput } from "../../extension/src/platforms/douyin/find-douyin-cover-file-input";

describe("applyDouyinCoverViaModal", () => {
	it("assigning cover file is detected as applied", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
					<input type="file" accept="image/png" />
				</div>
			</div>
		`;

		const dragArea = document.querySelector(".semi-upload-drag-area");
		const input = findDouyinCoverFileInput(document, dragArea instanceof HTMLElement ? dragArea : null);
		expect(input).not.toBeNull();
		if (!input) return;

		const file = new File(["x"], "cover.png", { type: "image/png" });
		assignFileToInput(input, file);
		expect(inputHasAnyFile(input)).toBe(true);
		expect(douyinCoverUploadLooksApplied(document)).toBe(true);
	});

	it("finds file input when search root is the modal element", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
					<input type="file" accept="image/png" />
				</div>
			</div>
		`;

		const modal = document.querySelector("#dy-creator-content-modal-body");
		const dragArea = document.querySelector(".semi-upload-drag-area");
		expect(modal).toBeInstanceOf(HTMLElement);
		expect(dragArea).toBeInstanceOf(HTMLElement);
		if (!(modal instanceof HTMLElement) || !(dragArea instanceof HTMLElement)) return;

		expect(findDouyinCoverFileInput(document, dragArea)).not.toBeNull();
		expect(findDouyinCoverFileInput(modal, dragArea)).not.toBeNull();
	});

	it("applies cover when modal is already open", async () => {
		document.body.innerHTML = `
			<div class="filter-k_CjvJ">
				<div class="title-wA45Xd">选择封面</div>
			</div>
			<div id="dy-creator-content-modal-body">
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
					<input type="file" accept="image/png" />
				</div>
			</div>
		`;

		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyDouyinCoverViaModal(document, file)).resolves.toBe(true);
	});
});
