/**
 * @jest-environment jsdom
 */
import { selectBilibiliCreativeStatementValue } from "../../extension/src/platforms/bilibili/select-bilibili-creative-statement-value";

const MAIN_OPTION = "内容无需标注";
const AUTH_OPTION = "内容为自制：未经作者允许，禁止转载";

function buildStatementMarkup(): string {
	return `
		<div class="statement-content">
			<div class="bcc-select">
				<div class="bcc-select-input-wrap">
					<input type="text" readonly placeholder="请选择符合您视频内容的创作声明" class="bcc-select-input-inner" value="">
					<i class="bcc-iconfont bcc-icon-ic_drop-down"></i>
				</div>
				<div class="bcc-select-list-wrap" style="display: none;">
					<ul class="bcc-select-option-list">
						<li class="bcc-option"><span>${MAIN_OPTION}</span></li>
						<li class="bcc-option"><span>含AI生成内容</span></li>
						<div class="auth-title">是否添加内容授权声明（非必选）</div>
						<div class="auth-content"><span class="option-text">${AUTH_OPTION}</span></div>
					</ul>
				</div>
			</div>
		</div>
	`;
}

function wireStatementDropdown(): void {
	const inputWrap = document.querySelector(".bcc-select-input-wrap");
	const listWrap = document.querySelector(".bcc-select-list-wrap");
	const input = document.querySelector(".bcc-select-input-inner");

	inputWrap?.addEventListener("click", () => {
		if (listWrap instanceof HTMLElement) listWrap.style.display = "block";
	});

	for (const option of Array.from(document.querySelectorAll("li.bcc-option"))) {
		option.addEventListener("click", () => {
			const label = option.querySelector("span");
			if (input instanceof HTMLInputElement && label) input.value = label.textContent ?? "";
			if (listWrap instanceof HTMLElement) listWrap.style.display = "none";
		});
	}

	const auth = document.querySelector(".auth-content");
	auth?.addEventListener("click", () => {
		auth.classList.add("selected");
		if (listWrap instanceof HTMLElement) listWrap.style.display = "none";
	});
}

describe("selectBilibiliCreativeStatementValue", () => {
	it("opens the dropdown and selects the default main and auth options", async () => {
		document.body.innerHTML = buildStatementMarkup();
		wireStatementDropdown();

		await expect(
			selectBilibiliCreativeStatementValue(document, MAIN_OPTION, AUTH_OPTION),
		).resolves.toBe(true);

		const input = document.querySelector(".bcc-select-input-inner");
		expect(input instanceof HTMLInputElement ? input.value : "").toBe(MAIN_OPTION);
		expect(document.querySelector(".auth-content")?.classList.contains("selected")).toBe(true);
	});

	it("returns true when defaults are already selected", async () => {
		document.body.innerHTML = buildStatementMarkup();
		wireStatementDropdown();

		const input = document.querySelector(".bcc-select-input-inner");
		if (input instanceof HTMLInputElement) input.value = MAIN_OPTION;
		document.querySelector(".auth-content")?.classList.add("selected");

		await expect(
			selectBilibiliCreativeStatementValue(document, MAIN_OPTION, AUTH_OPTION),
		).resolves.toBe(true);
	});
});
