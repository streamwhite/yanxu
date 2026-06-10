/**
 * @jest-environment jsdom
 */
import { findChannelsUseMaterialButton } from "../../extension/src/platforms/channels/find-channels-use-material-button";

describe("findChannelsUseMaterialButton", () => {
	it("finds 使用素材 inside btn-use wrap without file input dialog", () => {
		document.body.innerHTML = `
			<div class="weui-desktop-popover">
				<div class="weui-desktop-btn_wrp btn-use">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">使用素材</button>
				</div>
			</div>
		`;

		const button = findChannelsUseMaterialButton(document);
		expect(button?.textContent?.trim()).toBe("使用素材");
		expect(button?.closest(".btn-use")).not.toBeNull();
	});
});
