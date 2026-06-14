/**
 * @jest-environment jsdom
 */
import { findDouyinSubmitControl } from "../../extension/src/platforms/douyin/find-douyin-submit-control";

describe("findDouyinSubmitControl", () => {
	it("finds publish button via primary/fixed class fallback", () => {
		document.body.innerHTML = `
			<button class="button-dhlUZE primary-cECiOJ fixed-J9O8Yw">发布</button>
		`;

		const control = findDouyinSubmitControl(document);
		expect(control?.textContent?.trim()).toBe("发布");
	});
});
