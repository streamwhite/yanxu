/**
 * @jest-environment jsdom
 */
import { Platform } from "@auto-upload/domain";
import { findPlatformSubmitControl } from "../../extension/src/platforms/find-platform-submit-control";

describe("findPlatformSubmitControl", () => {
	it("finds bilibili submit span", () => {
		document.body.innerHTML = `
			<span class="submit-add" data-reporter-id="87">立即投稿</span>
		`;

		const control = findPlatformSubmitControl(document, Platform.Bilibili);
		expect(control?.className).toContain("submit-add");
		expect(control?.textContent).toContain("立即投稿");
	});

	it("finds douyin publish button", () => {
		document.body.innerHTML = `
			<span id="popover-tip-container">
				<button class="button-dhlUZE primary-cECiOJ fixed-J9O8Yw">发布</button>
			</span>
		`;

		const control = findPlatformSubmitControl(document, Platform.Douyin);
		expect(control?.tagName).toBe("BUTTON");
		expect(control?.textContent).toContain("发布");
	});

	it("finds channels publish button", () => {
		document.body.innerHTML = `
			<span class="weui-desktop-popover__target">
				<div class="weui-desktop-btn_wrp">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary">发表</button>
				</div>
			</span>
		`;

		const control = findPlatformSubmitControl(document, Platform.Channels);
		expect(control?.className).toContain("weui-desktop-btn_primary");
		expect(control?.textContent).toContain("发表");
	});
});
