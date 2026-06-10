/**
 * @jest-environment jsdom
 */
import { applyChannelsCoverViaModal } from "../../extension/src/platforms/channels/apply-channels-cover-via-modal";
import { channelsCoverWrapLooksUserUploaded } from "../../extension/src/platforms/channels/channels-cover-upload-looks-applied";

describe("applyChannelsCoverViaModal", () => {
	jest.setTimeout(60_000);

	it("uploads vertical, confirms, then reuses material for horizontal", async () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<div class="vertical-img-wrap">
					<img src="https://finder.video.qq.com/stodownload?token=auto" />
				</div>
				<button type="button" class="edit-btn">编辑</button>
			</div>
			<div class="horizon-cover-wrap img-popover-wrap">
				<div class="horizon-img-wrap">
					<img src="https://finder.video.qq.com/stodownload?token=auto-h" />
				</div>
				<button type="button" class="edit-btn">编辑</button>
			</div>
		`;

		const openVerticalDialog = () => {
			document.querySelector(".weui-desktop-popover")?.remove();
			const dialog = document.createElement("div");
			dialog.className = "weui-desktop-popover";
			dialog.innerHTML = `
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
				<div class="weui-desktop-btn_wrp">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">确认</button>
				</div>
			`;
			document.body.append(dialog);

			const input = dialog.querySelector('input[type="file"]');
			input?.addEventListener("change", () => {
				const img = document.createElement("img");
				img.src = "blob:cover-test";
				img.width = 120;
				img.height = 120;
				dialog.append(img);
				document.querySelector(".vertical-img-wrap")?.append(img.cloneNode(true));
			});

			dialog.querySelector("button")?.addEventListener("click", () => {
				dialog.remove();
			});
		};

		const openHorizontalDialog = () => {
			document.querySelector(".weui-desktop-popover")?.remove();
			const dialog = document.createElement("div");
			dialog.className = "weui-desktop-popover";
			dialog.innerHTML = `
				<div class="weui-desktop-btn_wrp btn-use">
					<button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">使用素材</button>
				</div>
			`;
			document.body.append(dialog);

			dialog.querySelector("button")?.addEventListener("click", () => {
				const img = document.createElement("img");
				img.src = "blob:horizon-cover";
				img.width = 120;
				img.height = 120;
				document.querySelector(".horizon-img-wrap")?.append(img);
			});
		};

		document.querySelector(".vertical-cover-wrap .edit-btn")?.addEventListener("click", openVerticalDialog);
		document.querySelector(".horizon-cover-wrap .edit-btn")?.addEventListener("click", openHorizontalDialog);

		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyChannelsCoverViaModal(document, file)).resolves.toBe(true);

		expect(channelsCoverWrapLooksUserUploaded(document, ".vertical-cover-wrap")).toBe(true);
		expect(channelsCoverWrapLooksUserUploaded(document, ".horizon-cover-wrap")).toBe(true);
		expect(document.querySelector(".weui-desktop-popover")).not.toBeNull();
	});
});
