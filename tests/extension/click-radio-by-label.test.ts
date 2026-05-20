/**
 * @jest-environment jsdom
 */
import { clickRadioOptionByLabel } from "../../extension/src/content/click-radio-by-label";

describe("clickRadioOptionByLabel", () => {
	it("clicks the container whose label matches 自制", () => {
		document.body.innerHTML = `
			<div class="type-check-radio-wrp">
				<div class="check-radio-v2-container" data-test="original">
					<span class="check-radio-v2-box"></span>
					<span class="check-radio-v2-name">自制</span>
				</div>
				<div class="check-radio-v2-container" data-test="repost">
					<span class="check-radio-v2-box"></span>
					<span class="check-radio-v2-name">转载</span>
				</div>
			</div>
		`;

		const clicked: HTMLElement[] = [];
		for (const node of Array.from(document.querySelectorAll(".check-radio-v2-container"))) {
			if (!(node instanceof HTMLElement)) continue;
			node.addEventListener("click", () => clicked.push(node));
		}

		expect(clickRadioOptionByLabel(document, [".type-check-radio-wrp"], "自制")).toBe(true);
		expect(clicked).toHaveLength(1);
		expect(clicked[0]?.dataset.test).toBe("original");
	});
});
