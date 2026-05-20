/**
 * @jest-environment jsdom
 */
import { applyCoverViaModal } from "../../extension/src/content/apply-cover-via-modal";

describe("applyCoverViaModal", () => {
	it("clicks cover-img then assigns file in cover modal upload area", async () => {
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
		await expect(applyCoverViaModal(document, file)).resolves.toBe(true);

		const input = document.querySelector('input[type="file"]');
		expect(input instanceof HTMLInputElement && input.files?.[0]?.name).toBe("cover.png");
	});
});
