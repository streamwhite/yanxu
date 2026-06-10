/**
 * @jest-environment jsdom
 */
import { closeDouyinCoverModal } from "../../extension/src/platforms/douyin/close-douyin-cover-modal";

describe("closeDouyinCoverModal", () => {
	it("clicks 确定 inside the douyin cover modal", () => {
		document.body.innerHTML = `
			<div id="dy-creator-content-modal-body">
				<button type="button">确定</button>
			</div>
		`;

		const button = document.querySelector("button");
		const clicked: HTMLElement[] = [];
		button?.addEventListener("click", () => {
			if (button instanceof HTMLElement) clicked.push(button);
		});

		expect(closeDouyinCoverModal(document)).toBe(true);
		expect(clicked).toHaveLength(1);
	});
});
