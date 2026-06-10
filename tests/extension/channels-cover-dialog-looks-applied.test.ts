/**
 * @jest-environment jsdom
 */
import { channelsCoverDialogLooksApplied } from "../../extension/src/platforms/channels/channels-cover-upload-looks-applied";

describe("channelsCoverDialogLooksApplied", () => {
	it("detects blob preview inside the upload popover", () => {
		document.body.innerHTML = `
			<div class="weui-desktop-popover">
				<img src="blob:dialog-preview" width="80" height="80" />
			</div>
		`;

		const dialog = document.querySelector(".weui-desktop-popover");
		if (!(dialog instanceof HTMLElement)) throw new Error("missing dialog");

		expect(channelsCoverDialogLooksApplied(dialog)).toBe(true);
	});
});
