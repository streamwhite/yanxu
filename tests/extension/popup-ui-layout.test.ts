import { readFileSync } from "node:fs";

const POPUP_HTML_PATH = "extension/popup.html";
const OPTIONS_HTML_PATH = "extension/options.html";

describe("popup UI layout", () => {
	const popupHtml = readFileSync(POPUP_HTML_PATH, "utf8");
	const optionsHtml = readFileSync(OPTIONS_HTML_PATH, "utf8");

	it("hides the internal batch job tagline", () => {
		expect(popupHtml).not.toContain("Batch job (v3)");
	});

	it("groups the local job source and platform scope as one preparation section", () => {
		expect(popupHtml).toContain('id="openBrowserFileSourceButton"');
		expect(popupHtml).toContain('id="batchPlatformScopeSelect"');
		const prepStart = popupHtml.indexOf('id="openBrowserFileSourceButton"');
		const prepEnd = popupHtml.indexOf("</section>", prepStart);
		const scopeIndex = popupHtml.indexOf('id="batchPlatformScopeSelect"');
		const uploadFillIndex = popupHtml.indexOf('id="uploadAndFillAllTabsButton"');
		expect(scopeIndex).toBeGreaterThan(prepStart);
		expect(scopeIndex).toBeLessThan(prepEnd);
		// The upload action lives in its own section, away from preparation.
		expect(uploadFillIndex).toBeGreaterThan(prepEnd);
	});

	it("opens the upload tabs from the upload step instead of a separate step", () => {
		expect(popupHtml).not.toContain('id="openAllTabsButton"');
		expect(popupHtml).not.toContain("打开上传页面");
	});

	it("presents the three popup areas as numbered workflow steps", () => {
		expect(popupHtml.match(/class="workflow-step-number"/g)).toHaveLength(3);
		expect(popupHtml).toMatch(/01[\s\S]*准备/);
		expect(popupHtml).toMatch(/02[\s\S]*上传和填写/);
		expect(popupHtml).toMatch(/03[\s\S]*发布（审核后）/);
	});

	it("keeps the video upload and horizontal cover controls together", () => {
		expect(popupHtml).toMatch(
			/id="submitHorizontalCoverCheckbox"[\s\S]*id="uploadAndFillAllTabsButton"/,
		);
	});

	it("removes the long action explanations from static markup", () => {
		expect(popupHtml).not.toContain(
			"Uploads videos on all tabs, waits for pages to settle, then fills fields and cover.",
		);
		expect(popupHtml).not.toContain(
			"After reviewing tabs in the browser, submit all tabs on bilibili, douyin, and 视频号.",
		);
	});

	it("does not show the 视频号 batch settings label text", () => {
		expect(popupHtml).not.toContain("视频号 batch settings");
		expect(popupHtml).not.toContain('id="openOptionsButton"');
	});

	it("keeps the progress log hidden and exposes a copy button", () => {
		expect(popupHtml).toContain('id="copyBatchProgressLogButton"');
		expect(popupHtml).toMatch(/<pre id="batchProgressLog"[^>]*hidden/);
	});

	it("offers file-system access for the local job source", () => {
		expect(popupHtml).toContain('id="openBrowserFileSourceButton"');
		expect(popupHtml).not.toContain('id="jobFilePathInput"');
		expect(popupHtml).toContain('id="browserFileSourceStatus"');
		expect(optionsHtml).toContain('id="chooseBrowserJobFileButton"');
		expect(optionsHtml).toContain('id="chooseBrowserAssetsDirButton"');
		expect(optionsHtml).toContain('id="restoreBrowserSourcePermissionButton"');
	});

	it("moves the settle delay setting to the options page", () => {
		expect(popupHtml).not.toContain('id="fieldsSettleMsInput"');
		expect(optionsHtml).toContain('id="fieldsSettleMsInput"');
	});
});
