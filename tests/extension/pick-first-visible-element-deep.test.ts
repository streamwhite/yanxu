/**
 * @jest-environment jsdom
 */
import { pickFirstElementDeep, pickFirstVisibleElementDeep } from "../../extension/src/content/dom";

describe("pickFirstVisibleElementDeep", () => {
	it("skips hidden inputs and returns the visible title field", () => {
		document.body.innerHTML = `
			<input id="hidden-title" placeholder="请输入稿件标题" style="display:none" />
			<input id="visible-title" placeholder="请输入稿件标题" />
		`;

		const hiddenFirst = pickFirstElementDeep(document, ['input[placeholder*="请输入稿件标题"]']);
		expect(hiddenFirst?.id).toBe("hidden-title");

		const visible = pickFirstVisibleElementDeep(document, ['input[placeholder*="请输入稿件标题"]']);
		expect(visible?.id).toBe("visible-title");
	});
});
