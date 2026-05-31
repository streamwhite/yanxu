/**
 * @jest-environment jsdom
 */
import { findChannelsOriginalDeclareLabel } from "../../extension/src/platforms/channels/find-channels-original-declare-label";

describe("findChannelsOriginalDeclareLabel", () => {
	it("prefers the checkbox inside declare-original-checkbox", () => {
		document.body.innerHTML = `
			<label class="ant-checkbox-wrapper"><span>其他选项</span></label>
			<div class="declare-original-checkbox">
				<label class="ant-checkbox-wrapper">
					<span>声明后，作品将展示原创标记，有机会获得广告收入。</span>
				</label>
			</div>
		`;

		const label = findChannelsOriginalDeclareLabel(document);
		expect(label?.closest(".declare-original-checkbox")).not.toBeNull();
	});
});
