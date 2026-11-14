/**
 * @jest-environment jsdom
 */
import { findChannelsVideoUploadArea } from "../../extension/src/platforms/channels/find-channels-video-upload-area";

const WECHAT_UPLOAD_AREA_HTML = `
<div class="upload-content">
  <div class="center">
    <span class="add-icon weui-icon-outlined-add"></span>
    <div class="upload-tip">
      <span>上传时长8小时内，大小不超过20GB，建议分辨率720p及以上，码率10Mbps以内，格式为MP4/H.264格式</span>
    </div>
  </div>
</div>
<input type="file" accept="video/mp4" style="display:none" />
`;

const WECHAT_UPLOAD_AREA_NEW_HTML = `
<div class="ant-upload-drag-container">
  <div class="upload-content">
    <div class="center">
      <span class="add-icon weui-icon-outlined-add"></span>
      <div class="upload-tip">
        <span>支持上传 8 小时以内、不超过20GB 的视频。建议分辨率为 1080p 及以上。</span>
        <div class="weui-desktop-popover__wrp info-popover">
          <span class="weui-desktop-popover__target"><span class="info-icon weui-icon-outlined-info"></span></span>
        </div>
      </div>
    </div>
  </div>
</div>
`;

describe("findChannelsVideoUploadArea", () => {
	it("finds WeChat video upload area by upload-content and tip text", () => {
		document.body.innerHTML = WECHAT_UPLOAD_AREA_HTML;

		const area = findChannelsVideoUploadArea(document);
		expect(area?.classList.contains("upload-content")).toBe(true);
		expect(area?.textContent).toContain("MP4/H.264");
	});

	it("recognizes the newer 20GB / 1080p upload tip", () => {
		document.body.innerHTML = WECHAT_UPLOAD_AREA_NEW_HTML;

		const area = findChannelsVideoUploadArea(document);
		expect(area?.classList.contains("upload-content")).toBe(true);
		expect(area?.textContent).toContain("不超过20GB");
	});
});
