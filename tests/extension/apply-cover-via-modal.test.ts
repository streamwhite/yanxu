/**
 * @jest-environment jsdom
 */
import { Platform } from "@auto-upload/domain";
import { applyCoverViaModal } from "../../extension/src/content/apply-cover-via-modal";

describe("applyCoverViaModal", () => {
	it("clicks cover-img edit-text then assigns file in cover modal", async () => {
		document.body.innerHTML = `
			<div class="cover-img">
				<span class="edit-text">封面设置</span>
			</div>
		`;

		const trigger = document.querySelector(".cover-img");
		trigger?.addEventListener("click", () => {
			const modal = document.createElement("div");
			modal.className = "modal";
			modal.innerHTML = `
				<div class="upload-area">
					<span class="upload-text">上传封面</span>
					<input type="file" accept="image/png" />
				</div>
			`;
			document.body.append(modal);
		});

		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Bilibili)).resolves.toBe(true);

		const input = document.querySelector('input[type="file"]');
		expect(input instanceof HTMLInputElement && input.files?.[0]?.name).toBe("cover.png");
	});

	it("uses douyin cover pipeline inside creator modal body", async () => {
		document.body.innerHTML = `
			<div class="filter-k_CjvJ">
				<div class="title-wA45Xd">选择封面</div>
			</div>
		`;

		const trigger = document.querySelector(".filter-k_CjvJ");
		trigger?.addEventListener("click", () => {
			const modal = document.createElement("div");
			modal.id = "dy-creator-content-modal-body";
			modal.innerHTML = `
				<div class="semi-upload upload-BvM5FF">
					<div class="semi-upload-drag-area">
						<div class="semi-upload-drag-area-main-text">点击上传文件或拖拽文件到这里</div>
					</div>
					<input type="file" accept="image/png" />
				</div>
			`;
			document.body.append(modal);

			const input = modal.querySelector('input[type="file"]');
			input?.addEventListener("change", () => {
				const list = document.createElement("div");
				list.className = "semi-upload-file-list";
				modal.append(list);
			});
		});

		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Douyin)).resolves.toBe(true);

		const input = document.querySelector("#dy-creator-content-modal-body input[type='file']");
		expect(input instanceof HTMLInputElement && input.files?.[0]?.name).toBe("cover.png");
	});

	it("uses channels cover pipeline after 编辑 opens upload dialog", async () => {
		document.body.innerHTML = `
			<div class="vertical-cover-wrap img-popover-wrap">
				<div class="vertical-img-wrap"></div>
				<div class="cover-tips">封面</div>
				<button type="button" class="edit-btn">编辑</button>
			</div>
		`;

		const trigger = document.querySelector(".edit-btn");
		trigger?.addEventListener("click", () => {
			const dialog = document.createElement("div");
			dialog.className = "weui-desktop-popover";
			dialog.innerHTML = `
				<div class="weui-desktop-upload">上传封面</div>
				<input type="file" accept="image/png" />
			`;
			document.body.append(dialog);

			const input = dialog.querySelector('input[type="file"]');
			input?.addEventListener("change", () => {
				const img = document.createElement("img");
				img.src = "blob:cover-test";
				img.width = 120;
				img.height = 120;
				document.querySelector(".vertical-img-wrap")?.append(img);
			});
		});

		const file = new File(["x"], "cover.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Channels)).resolves.toBe(true);

		const input = document.querySelector(".weui-desktop-popover input[type='file']");
		expect(input instanceof HTMLInputElement && input.files?.[0]?.name).toBe("cover.png");
	});
});
