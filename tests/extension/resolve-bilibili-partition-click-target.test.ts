/**
 * @jest-environment jsdom
 */
import { resolveBilibiliPartitionClickTarget } from "../../extension/src/platforms/bilibili/resolve-bilibili-partition-click-target";

describe("resolveBilibiliPartitionClickTarget", () => {
	it("clicks the select-item row instead of the inner label", () => {
		document.body.innerHTML = `
			<div class="select-item">
				<p class="select-item-cont">知识</p>
			</div>
		`;

		const label = document.querySelector(".select-item-cont");
		if (!(label instanceof HTMLElement)) throw new Error("missing label");

		const target = resolveBilibiliPartitionClickTarget(label);
		expect(target.classList.contains("select-item")).toBe(true);
	});
});
