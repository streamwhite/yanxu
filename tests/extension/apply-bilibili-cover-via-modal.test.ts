/**
 * @jest-environment jsdom
 */
import { Platform } from "@yanxu/domain";
import { applyCoverViaModal } from "../../extension/src/content/apply-cover-via-modal";

const TRIGGER_HTML = `
	<div class="cover-img">
		<span class="edit-text">封面设置</span>
	</div>
`;

function openEditor(html: string): void {
	document.querySelector(".cover-img")?.addEventListener("click", () => {
		const editor = document.createElement("div");
		editor.className = "cover-editor";
		editor.innerHTML = html;
		document.body.append(editor);
	});
}

describe("bilibili cover via modal", () => {
	it("enables 双比例同步改动 and uploads the 4x3 file without closing the editor", async () => {
		document.body.innerHTML = TRIGGER_HTML;
		openEditor(`
			<div class="operation">
				<div class="sync">
					<label class="sync-checkbox">
						<input type="checkbox" />
						<span>双比例同步改动</span>
					</label>
				</div>
			</div>
			<div class="upload-area">
				<span class="upload-text">上传封面</span>
				<input type="file" accept="image/png" />
			</div>
			<div class="button submit">完成</div>
		`);

		let completed = false;
		document.addEventListener("click", (event) => {
			if (event.target instanceof HTMLElement && event.target.textContent === "完成") {
				completed = true;
			}
		});

		const vertical = new File(["v"], "cover.png", { type: "image/png" });
		const horizontal = new File(["h"], "cover-4x3.png", { type: "image/png" });
		await expect(
			applyCoverViaModal(document, vertical, Platform.Bilibili, horizontal),
		).resolves.toBe(true);

		const syncInput = document.querySelector<HTMLInputElement>(".sync-checkbox input");
		const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
		expect(syncInput?.checked).toBe(true);
		expect(fileInput?.files?.[0]?.name).toBe("cover-4x3.png");
		expect(completed).toBe(false);
		expect(document.querySelector(".cover-editor")).not.toBeNull();
	});

	it("waits for the sync option when the editor mounts it after the file input", async () => {
		document.body.innerHTML = TRIGGER_HTML;
		openEditor(`
			<div class="upload-area">
				<span class="upload-text">上传封面</span>
				<input type="file" accept="image/png" />
			</div>
		`);
		document.querySelector(".cover-img")?.addEventListener("click", () => {
			setTimeout(() => {
				const sync = document.createElement("div");
				sync.innerHTML = `
					<div class="operation">
						<div class="sync">
							<label class="sync-checkbox"><input type="checkbox" /><span>双比例同步改动</span></label>
						</div>
					</div>
				`;
				document.querySelector(".cover-editor")?.prepend(sync);
			}, 200);
		});

		const file = new File(["h"], "cover-4x3.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Bilibili)).resolves.toBe(true);

		const syncInput = document.querySelector<HTMLInputElement>(".sync-checkbox input");
		expect(syncInput?.checked).toBe(true);
	});

	it("uploads through the current 封面制作 editor even when the file input is hidden", async () => {
		document.body.innerHTML = `
			<div class="cover-module-main">
				<div class="cover-empty">上传封面</div>
			</div>
		`;
		document.querySelector(".cover-empty")?.addEventListener("click", () => {
			const editor = document.createElement("div");
			editor.className = "cover-editor";
			editor.innerHTML = `
				<div class="operation">
					<div class="sync">
						<label class="sync-checkbox"><input type="checkbox" /><span>双比例同步改动</span></label>
					</div>
				</div>
				<input type="file" accept="image/png" style="display: none" />
				<div class="button submit">完成</div>
			`;
			document.body.append(editor);
		});

		const file = new File(["h"], "cover-4x3.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Bilibili)).resolves.toBe(true);

		const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
		expect(fileInput?.files?.[0]?.name).toBe("cover-4x3.png");
	});

	it("falls back to the default cover and the classic upload area", async () => {
		document.body.innerHTML = TRIGGER_HTML;
		openEditor(`
			<div class="upload-area">
				<span class="upload-text">上传封面</span>
				<input type="file" accept="image/png" />
			</div>
		`);

		const file = new File(["v"], "cover.png", { type: "image/png" });
		await expect(applyCoverViaModal(document, file, Platform.Bilibili)).resolves.toBe(true);

		const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
		expect(fileInput?.files?.[0]?.name).toBe("cover.png");
	});
});
