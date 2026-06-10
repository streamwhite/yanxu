/**
 * @jest-environment jsdom
 */
import { findDouyinCoverTrigger } from "../../extension/src/platforms/douyin/find-douyin-cover-trigger";

describe("findDouyinCoverTrigger", () => {
	it("finds the 选择封面 filter control without coverControl wrapper", () => {
		document.body.innerHTML = `
			<div class="filter-k_CjvJ">
				<div class="title-wA45Xd">选择封面</div>
			</div>
		`;

		const trigger = findDouyinCoverTrigger(document);
		expect(trigger?.className).toContain("filter");
	});

	it("finds the vertical 竖封面 control", () => {
		document.body.innerHTML = `
			<div class="coverControl-CjlzqC">
				<div class="filter-k_CjvJ">
					<div class="title-wA45Xd">选择封面</div>
				</div>
				<div class="controlContainer-psV7_j">
					<div class="cover-tip-YkBvmu">竖封面3:4</div>
				</div>
			</div>
			<div class="coverControl-CjlzqC">
				<div class="filter-k_CjvJ">
					<div class="title-wA45Xd">选择封面</div>
				</div>
				<div class="controlContainer-psV7_j">
					<div class="cover-tip-YkBvmu">横封面4:3</div>
				</div>
			</div>
		`;

		const vertical = findDouyinCoverTrigger(document, "vertical");
		const horizontal = findDouyinCoverTrigger(document, "horizontal");
		expect(vertical?.closest(".coverControl-CjlzqC")?.textContent).toContain("竖封面");
		expect(horizontal?.closest(".coverControl-CjlzqC")?.textContent).toContain("横封面");
	});
});
