/**
 * @jest-environment jsdom
 */
import { findChannelsCoverUploadDialog } from "../../extension/src/platforms/channels/find-channels-cover-upload-dialog";
import { isChannelsPageCoverWrap } from "../../extension/src/platforms/channels/is-channels-page-cover-wrap";

describe("findChannelsCoverUploadDialog", () => {
	it("ignores page cover wrap and finds upload dialog with file input", () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<div class="cover-tips">封面</div>
				<button type="button" class="edit-btn">编辑</button>
			</div>
			<div class="weui-desktop-popover">
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
			</div>
		`;

		const pageWrap = document.querySelector(".vertical-cover-wrap");
		expect(pageWrap instanceof HTMLElement && isChannelsPageCoverWrap(pageWrap)).toBe(true);

		const dialog = findChannelsCoverUploadDialog(document);
		expect(dialog?.className).toContain("weui-desktop-popover");
		expect(dialog?.querySelector('input[type="file"]')).not.toBeNull();
	});
});
