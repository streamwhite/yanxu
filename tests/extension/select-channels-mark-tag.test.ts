/**
 * @jest-environment jsdom
 */
import { selectChannelsMarkTagValue } from "../../extension/src/platforms/channels/select-channels-mark-tag-value";
import { CHANNELS_DEFAULT_MARK_TAG_OPTION } from "@yanxu/domain";

const PLACEHOLDER = "选择视频标注";

function buildMarkTagMarkup(): string {
	return `
		<div class="form-item cell-center post-with-mark-tag">
			<div class="label with-tip-label"><span>视频标注</span></div>
			<div class="form-item-body mark-tag-body">
				<div class="mark-tag-select">
					<div class="select-display">
						<span class="select-placeholder">${PLACEHOLDER}</span>
					</div>
					<span class="select-arrow weui-icon-outlined-arrow"></span>
					<div class="mark-tag-options" style="display: none;">
						<div class="mark-tag-option"><div class="option-main">无需标注</div></div>
						<div class="mark-tag-option"><div class="option-main">含AI生成内容</div></div>
						<div class="mark-tag-option"><div class="option-main">内容为虚构剧情，仅供娱乐</div></div>
						<div class="mark-tag-option"><div class="option-main">${CHANNELS_DEFAULT_MARK_TAG_OPTION}</div></div>
						<div class="mark-tag-option"><div class="option-main">内容包含营销广告</div></div>
						<div class="mark-tag-option"><div class="option-main">内容为自行拍摄</div><div class="option-sub">添加拍摄时间和地点</div></div>
						<div class="mark-tag-option"><div class="option-main">内容为转载</div><div class="option-sub">添加转载来源(选填)</div></div>
					</div>
				</div>
			</div>
		</div>
	`;
}

function wireMarkTagDropdown(): void {
	const display = document.querySelector(".select-display");
	const options = document.querySelector(".mark-tag-options");

	display?.addEventListener("click", () => {
		if (options instanceof HTMLElement) options.style.display = "block";
	});

	for (const option of Array.from(document.querySelectorAll(".mark-tag-option"))) {
		option.addEventListener("click", () => {
			const main = option.querySelector(".option-main");
			const displayBox = document.querySelector(".select-display");
			if (displayBox instanceof HTMLElement && main) {
				displayBox.textContent = main.textContent ?? "";
			}
			if (options instanceof HTMLElement) options.style.display = "none";
		});
	}
}

describe("selectChannelsMarkTagValue", () => {
	it("opens the dropdown and selects the default option", async () => {
		document.body.innerHTML = buildMarkTagMarkup();
		wireMarkTagDropdown();

		await expect(
			selectChannelsMarkTagValue(document, CHANNELS_DEFAULT_MARK_TAG_OPTION),
		).resolves.toBe(true);

		expect(document.querySelector(".select-display")?.textContent).toBe(
			CHANNELS_DEFAULT_MARK_TAG_OPTION,
		);
	});

	it("selects an option that has a sub hint", async () => {
		document.body.innerHTML = buildMarkTagMarkup();
		wireMarkTagDropdown();

		await expect(selectChannelsMarkTagValue(document, "内容为自行拍摄")).resolves.toBe(true);
		expect(document.querySelector(".select-display")?.textContent).toBe("内容为自行拍摄");
	});

	it("returns true when the default is already selected", async () => {
		document.body.innerHTML = buildMarkTagMarkup();
		wireMarkTagDropdown();

		const display = document.querySelector(".select-display");
		if (display instanceof HTMLElement) display.textContent = CHANNELS_DEFAULT_MARK_TAG_OPTION;

		await expect(
			selectChannelsMarkTagValue(document, CHANNELS_DEFAULT_MARK_TAG_OPTION),
		).resolves.toBe(true);
	});

	it("returns false when the dropdown is absent", async () => {
		document.body.innerHTML = "<div></div>";
		await expect(
			selectChannelsMarkTagValue(document, CHANNELS_DEFAULT_MARK_TAG_OPTION),
		).resolves.toBe(false);
	});
});
