/**
 * @jest-environment jsdom
 */
import { closeChannelsCoverUploadDialog } from "../../extension/src/platforms/channels/close-channels-cover-upload-dialog";

describe("closeChannelsCoverUploadDialog", () => {
	it("clicks 确定 inside the cover upload popover", () => {
		document.body.innerHTML = `
			<div class="weui-desktop-popover">
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
				<button type="button">确定</button>
			</div>
		`;

		const button = document.querySelector("button");
		const clicked: HTMLElement[] = [];
		button?.addEventListener("click", () => {
			if (button instanceof HTMLElement) clicked.push(button);
		});

		expect(closeChannelsCoverUploadDialog(document)).toBe(true);
		expect(clicked).toHaveLength(1);
	});
});
