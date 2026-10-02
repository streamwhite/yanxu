import { readFileSync } from "node:fs";

const POPUP_HTML_PATH = "extension/popup.html";
const OPTIONS_HTML_PATH = "extension/options.html";

describe("popup UI layout", () => {
	const popupHtml = readFileSync(POPUP_HTML_PATH, "utf8");
	const optionsHtml = readFileSync(OPTIONS_HTML_PATH, "utf8");

	it("hides the internal batch job tagline", () => {
		expect(popupHtml).not.toContain("Batch job (v3)");
	});

	it("groups the job file path and platform scope as one preparation section", () => {
		expect(popupHtml).toContain('id="jobFilePathInput"');
		expect(popupHtml).toContain('id="batchPlatformScopeSelect"');
		const prepStart = popupHtml.indexOf('id="jobFilePathInput"');
		const prepEnd = popupHtml.indexOf("</section>", prepStart);
		const scopeIndex = popupHtml.indexOf('id="batchPlatformScopeSelect"');
		const openTabsIndex = popupHtml.indexOf('id="openAllTabsButton"');
		const uploadFillIndex = popupHtml.indexOf('id="uploadAndFillAllTabsButton"');
		expect(scopeIndex).toBeGreaterThan(prepStart);
		expect(scopeIndex).toBeLessThan(prepEnd);
		// The open-tabs and upload/fill actions live in their own sections,
		// away from the preparation section.
		expect(openTabsIndex).toBeGreaterThan(prepEnd);
		expect(uploadFillIndex).toBeGreaterThan(openTabsIndex);
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

	it("moves the settle delay setting to the options page", () => {
		expect(popupHtml).not.toContain('id="fieldsSettleMsInput"');
		expect(optionsHtml).toContain('id="fieldsSettleMsInput"');
	});
});
