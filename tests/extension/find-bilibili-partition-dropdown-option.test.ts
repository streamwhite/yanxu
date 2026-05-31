/**
 * @jest-environment jsdom
 */
import { findBilibiliPartitionDropdownOption } from "../../extension/src/platforms/bilibili/list-bilibili-partition-dropdown-options";

describe("findBilibiliPartitionDropdownOption", () => {
	it("prefers the longest matching label when multiple options compact-match", () => {
		document.body.innerHTML = `
			<div class="select-controller"></div>
			<div class="dropdown-panel">
				<p class="select-item-cont">科技</p>
				<p class="select-item-cont">科技 · 数码</p>
			</div>
		`;

		const controller = document.querySelector(".select-controller");
		if (!(controller instanceof HTMLElement)) throw new Error("missing controller");

		const option = findBilibiliPartitionDropdownOption(document, controller, "科技数码");
		expect(option?.textContent?.replace(/\s+/g, "")).toContain("科技");
		expect(option?.textContent).toContain("数码");
	});
});
