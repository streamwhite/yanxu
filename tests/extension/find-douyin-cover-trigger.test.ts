/**
 * @jest-environment jsdom
 */
import { findDouyinCoverTrigger } from "../../extension/src/platforms/douyin/find-douyin-cover-trigger";

describe("findDouyinCoverTrigger", () => {
	it("finds the 选择封面 filter control", () => {
		document.body.innerHTML = `
			<div class="filter-k_CjvJ">
				<div class="title-wA45Xd">选择封面</div>
			</div>
		`;

		const trigger = findDouyinCoverTrigger(document);
		expect(trigger?.className).toContain("filter");
	});
});
