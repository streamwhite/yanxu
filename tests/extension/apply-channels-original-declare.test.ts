/**
 * @jest-environment jsdom
 */
import { applyChannelsOriginalDeclare } from "../../extension/src/content/apply-channels-original-declare";

describe("applyChannelsOriginalDeclare", () => {
	it("returns true when declare checkbox is already checked", async () => {
		document.body.innerHTML = `
			<div class="declare-original-checkbox">
				<label class="ant-checkbox-wrapper ant-checkbox-wrapper-checked">
					<span class="ant-checkbox ant-checkbox-checked">
						<input type="checkbox" class="ant-checkbox-input" value="" checked>
					</span>
					<span>声明后，作品将展示原创标记，有机会获得广告收入。</span>
				</label>
			</div>
		`;

		const applied = await applyChannelsOriginalDeclare(document);
		expect(applied).toBe(true);
	});

	it("checks declare checkbox inside declare-original-checkbox and confirms protocol modal", async () => {
		document.body.innerHTML = `
			<div class="form-item-body">
				<div class="declare-original-checkbox">
					<label class="ant-checkbox-wrapper">
						<span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""></span>
						<span>声明后，作品将展示原创标记，有机会获得广告收入。</span>
					</label>
				</div>
			</div>
			<div class="original-proto-wrapper" style="display:block">
				<label class="ant-checkbox-wrapper">
					<span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""></span>
				</label>
				<div class="protocol-text">我已阅读并同意</div>
				<button type="button" class="weui-desktop-btn weui-desktop-btn_primary">声明原创</button>
			</div>
		`;

		const applied = await applyChannelsOriginalDeclare(document);
		expect(applied).toBe(true);

		const declareInput = document.querySelector(
			".declare-original-checkbox input.ant-checkbox-input",
		) as HTMLInputElement | null;
		expect(declareInput?.checked).toBe(true);
	});

	it("checks declare checkbox and confirms protocol modal", async () => {
		document.body.innerHTML = `
			<label class="ant-checkbox-wrapper">
				<span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""></span>
				<span>声明后，作品将展示原创标记，有机会获得广告收入。</span>
			</label>
			<div class="original-proto-wrapper" style="display:block">
				<label class="ant-checkbox-wrapper">
					<span class="ant-checkbox"><input type="checkbox" class="ant-checkbox-input" value=""></span>
				</label>
				<div class="protocol-text">我已阅读并同意</div>
				<button type="button" class="weui-desktop-btn weui-desktop-btn_primary">声明原创</button>
			</div>
		`;

		const applied = await applyChannelsOriginalDeclare(document);
		expect(applied).toBe(true);

		const declareInput = document.querySelector(
			"label.ant-checkbox-wrapper input.ant-checkbox-input",
		) as HTMLInputElement | null;
		expect(declareInput?.checked).toBe(true);
	});
});
