/**
 * @jest-environment jsdom
 */
import { BILIBILI_DESCRIPTION_SELECTORS } from "../../extension/src/content/bilibili-selectors";
import { applyPageFields } from "../../extension/src/content/page-fields";

describe("applyPageFields", () => {
	it("fills description via data-placeholder when placeholder attribute is absent", () => {
		document.body.innerHTML =
			'<textarea data-placeholder="填写更全面的相关信息，让更多的人能找到你的视频吧"></textarea>';

		const missing = applyPageFields(document, [
			{
				locator: { css: BILIBILI_DESCRIPTION_SELECTORS[0] },
				selectorFallbacks: BILIBILI_DESCRIPTION_SELECTORS,
				value: "my description",
			},
		]);

		expect(missing).toEqual([]);
		const textarea = document.querySelector("textarea");
		expect(textarea?.value).toBe("my description");
	});
});
