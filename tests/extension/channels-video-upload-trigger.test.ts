/**
 * @jest-environment jsdom
 */
import { clickChannelsVideoUploadTrigger } from "../../extension/src/platforms/channels/channels-video-upload-trigger";

describe("clickChannelsVideoUploadTrigger", () => {
	it("clicks add icon inside upload-content", () => {
		document.body.innerHTML = `
<div class="upload-content">
  <div class="center">
    <span class="add-icon weui-icon-outlined-add"></span>
    <div class="upload-tip"><span>格式为MP4/H.264格式</span></div>
  </div>
</div>`;

		const addIcon = document.querySelector(".add-icon");
		const clickSpy = jest.spyOn(addIcon as HTMLElement, "click");

		const area = clickChannelsVideoUploadTrigger(document);
		expect(area?.classList.contains("upload-content")).toBe(true);
		expect(clickSpy).toHaveBeenCalled();
	});
});
