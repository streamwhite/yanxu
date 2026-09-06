/**
 * @jest-environment jsdom
 */
import { applyChannelsCoverViaModal } from "../../extension/src/platforms/channels/apply-channels-cover-via-modal";
import { channelsCoverWrapLooksUserUploaded } from "../../extension/src/platforms/channels/channels-cover-upload-looks-applied";

describe("applyChannelsCoverViaModal with horizontal file", () => {
	jest.setTimeout(60_000);

	it("uploads the -4x3 file to the horizon wrap instead of reusing the vertical material", async () => {
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

		let useMaterialClicked = 0;

		const openDialogFor = (wrapClass: string, withUseMaterial: boolean) => () => {
			document.querySelector(".weui-desktop-popover")?.remove();
			const dialog = document.createElement("div");
			dialog.className = "weui-desktop-popover";
			dialog.innerHTML = `
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
				${withUseMaterial ? `<div class="weui-desktop-btn_wrp btn-use"><button type="button" class="weui-desktop-btn weui-desktop-btn_primary weui-desktop-btn_mini">使用素材</button></div>` : ""}
			`;
			document.body.append(dialog);

			const input = dialog.querySelector('input[type="file"]');
			input?.addEventListener("change", () => {
				const img = document.createElement("img");
				img.src = "blob:cover-test";
				img.width = 120;
				img.height = 120;
				dialog.append(img);
				const target = withUseMaterial ? ".horizon-img-wrap" : ".vertical-img-wrap";
				document.querySelector(target)?.append(img.cloneNode(true));
			});

			dialog.querySelector(".btn-use button")?.addEventListener("click", () => {
				useMaterialClicked += 1;
				const img = document.createElement("img");
				img.src = "blob:horizon-material";
				img.width = 120;
				img.height = 120;
				document.querySelector(".horizon-img-wrap")?.append(img);
			});
		};

		document
			.querySelector(".vertical-cover-wrap .edit-btn")
			?.addEventListener("click", openDialogFor(".vertical-cover-wrap", false));
		document
			.querySelector(".horizon-cover-wrap .edit-btn")
			?.addEventListener("click", openDialogFor(".horizon-cover-wrap", true));

		const vertical = new File(["x"], "cover.png", { type: "image/png" });
		const horizontal = new File(["xy"], "cover-4x3.png", { type: "image/png" });

		await expect(applyChannelsCoverViaModal(document, vertical, horizontal)).resolves.toBe(true);

		expect(channelsCoverWrapLooksUserUploaded(document, ".vertical-cover-wrap")).toBe(true);
		expect(channelsCoverWrapLooksUserUploaded(document, ".horizon-cover-wrap")).toBe(true);
		expect(useMaterialClicked).toBe(0);
	});
});
