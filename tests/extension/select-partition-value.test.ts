/**
 * @jest-environment jsdom
 */
import { selectPartitionValue } from "../../extension/src/content/select-partition-value";

describe("selectPartitionValue", () => {
	it("opens the 分区 dropdown and selects a matching option", () => {
		document.body.innerHTML = `
			<section>
				<h3 class="section-title-content-main">分区</h3>
				<div class="select-controller">
					<p class="select-item-cont select-item-cont-inserted">生活</p>
				</div>
			</section>
			<div class="dropdown-panel">
				<p class="select-item-cont">生活</p>
				<p class="select-item-cont">vlog</p>
			</div>
		`;

		for (const option of Array.from(document.querySelectorAll(".select-item-cont"))) {
			option.addEventListener("click", () => {
				const display = document.querySelector(".select-controller .select-item-cont");
				if (display) display.textContent = option.textContent;
			});
		}

		expect(selectPartitionValue(document, "vlog")).toBe(true);
		const selected = document.querySelector(".select-controller .select-item-cont");
		expect(selected?.textContent?.trim()).toBe("vlog");
	});
});
