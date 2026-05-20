/**
 * @jest-environment jsdom
 */
import { findCoverModalUploadArea } from "../../extension/src/content/find-cover-modal-upload-area";

describe("findCoverModalUploadArea", () => {
	it("prefers visible upload-area with 上传封面 label", () => {
		document.body.innerHTML = `
			<div class="upload-area" style="width:100px;height:40px">
				<span>other upload</span>
			</div>
			<div class="upload-area" style="width:100px;height:40px">
				<span class="upload-text">上传封面</span>
			</div>
		`;

		const found = findCoverModalUploadArea(document);
		expect(found?.querySelector(".upload-text")?.textContent?.trim()).toBe("上传封面");
	});
});
