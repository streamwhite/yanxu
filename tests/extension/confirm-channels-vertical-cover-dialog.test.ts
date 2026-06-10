/**
 * @jest-environment jsdom
 */
import { confirmChannelsVerticalCoverDialog } from "../../extension/src/platforms/channels/confirm-channels-vertical-cover-dialog";

describe("confirmChannelsVerticalCoverDialog", () => {
	it("clicks 确认 inside weui-desktop-btn_wrp but not 确定", async () => {
		document.body.innerHTML = `
			<div class="weui-desktop-popover">
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
				<div class="weui-desktop-btn_wrp">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">确定</button>
				</div>
				<div class="weui-desktop-btn_wrp">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">确认</button>
				</div>
			</div>
		`;

		const clicked: string[] = [];
		for (const button of Array.from(document.querySelectorAll("button"))) {
			button.addEventListener("click", () => {
				clicked.push(button.textContent?.trim() ?? "");
			});
		}

		await expect(confirmChannelsVerticalCoverDialog(document)).resolves.toBe(true);
		expect(clicked).toContain("确认");
		expect(clicked).not.toContain("确定");
	});
});
