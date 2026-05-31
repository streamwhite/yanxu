/**
 * @jest-environment jsdom
 */
import { findChannelsCoverTrigger } from "../../extension/src/platforms/channels/find-channels-cover-trigger";

describe("findChannelsCoverTrigger", () => {
	it("finds the vertical cover 编辑 button", () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<div class="edit-btn edit-btn-zIndex">编辑</div>
			</div>
		`;

		const trigger = findChannelsCoverTrigger(document);
		expect(trigger?.textContent?.trim()).toBe("编辑");
	});

	it("does not target the horizon cover 编辑 button", () => {
		document.body.innerHTML = `
			<div class="horizon-cover-wrap img-popover-wrap">
				<div class="edit-btn">编辑</div>
			</div>
		`;

		expect(findChannelsCoverTrigger(document)).toBeNull();
	});
});
