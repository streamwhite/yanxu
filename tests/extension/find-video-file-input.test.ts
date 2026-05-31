/**
 * @jest-environment jsdom
 */
import { findVideoFileInput } from "../../extension/src/content/find-video-file-input";

describe("findVideoFileInput", () => {
	it("skips image-only file inputs and returns video input", () => {
		document.body.innerHTML = `
			<input type="file" accept="image/png,image/jpeg" />
			<input type="file" accept="video/mp4,video/*" />
		`;

		const input = findVideoFileInput(document, ['input[type="file"]']);
		expect(input?.accept).toContain("video");
	});
});
