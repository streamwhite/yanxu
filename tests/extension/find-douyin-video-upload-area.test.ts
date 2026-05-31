/**
 * @jest-environment jsdom
 */
import { findDouyinVideoUploadArea } from "../../extension/src/platforms/douyin/find-douyin-video-upload-area";
import {
	DOUYIN_DESCRIPTION_PLACEHOLDER,
	DOUYIN_TITLE_PLACEHOLDER,
} from "../../extension/src/platforms/douyin/douyin-selectors";

const DOUYIN_UPLOAD_SNIPPET = `
<div class="container-FNDpwE">
  <div class="upload-btn-PdfuUv">
    <div class="upload-card-null-NkwEdF">
      <p class="inner-info-giP2vJ">点击上传</p>
      <p class="inner-title-kg8IAW">或直接将视频文件拖入此区域</p>
    </div>
    <input class="upload-btn-input-UY_qeY" type="file" name="upload-btn" accept="video/mp4,video/*">
  </div>
</div>
<input class="semi-input semi-input-default" type="text" placeholder="${DOUYIN_TITLE_PLACEHOLDER}" value="">
<div class="editor-comp-publish" data-placeholder="${DOUYIN_DESCRIPTION_PLACEHOLDER}" contenteditable="true"></div>
`;

describe("findDouyinVideoUploadArea", () => {
	it("finds upload card from named file input", () => {
		document.body.innerHTML = DOUYIN_UPLOAD_SNIPPET;

		const area = findDouyinVideoUploadArea(document);
		expect(area?.className).toContain("upload-card");
		expect(area?.textContent).toContain("点击上传");
	});
});
