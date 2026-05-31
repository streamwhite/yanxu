/**
 * @jest-environment jsdom
 */
import { readBilibiliPartitionSelection } from "../../extension/src/platforms/bilibili/read-bilibili-partition-selection";

describe("readBilibiliPartitionSelection", () => {
	it("reads the inserted selection label from the controller", () => {
		document.body.innerHTML = `
			<div class="select-controller">
				<p class="select-item-cont">placeholder</p>
				<p class="select-item-cont select-item-cont-inserted">知识</p>
			</div>
		`;

		const controller = document.querySelector(".select-controller");
		if (!(controller instanceof HTMLElement)) throw new Error("missing controller");

		expect(readBilibiliPartitionSelection(controller)).toBe("知识");
	});
});
