/**
 * @jest-environment jsdom
 */
import { applyTagsWithEnter } from "../../extension/src/content/apply-tags-with-enter";

describe("applyTagsWithEnter", () => {
	it("types each tag and dispatches Enter", async () => {
		document.body.innerHTML = '<input data-test="tag" />';
		const input = document.querySelector("input");
		if (!(input instanceof HTMLInputElement)) throw new Error("input_missing");

		const enterCount = { value: 0 };
		input.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;
			enterCount.value += 1;
			input.value = "";
		});

		await expect(
			applyTagsWithEnter(document, ["input[data-test='tag']"], ["demo", "auto-upload"]),
		).resolves.toBe(true);
		expect(enterCount.value).toBe(2);
	});
});
