import { readFileSync } from "node:fs";
import {
	CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID,
	CHANNELS_SUBMIT_BATCH_INTERVAL_MIN_INPUT_ID,
	CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID,
} from "../../extension/src/options/options-ui";

const OPTIONS_HTML_PATH = "extension/options.html";
const POPUP_HTML_PATH = "extension/popup.html";
const MANIFEST_PATH = "extension/manifest.json";
const OPEN_OPTIONS_BUTTON_ID = "openOptionsButton";

describe("channels batch settings options page", () => {
	const optionsHtml = readFileSync(OPTIONS_HTML_PATH, "utf8");
	const popupHtml = readFileSync(POPUP_HTML_PATH, "utf8");
	const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
		options_ui?: { page?: string; open_in_tab?: boolean };
	};

	it("declares the 视频号 batch inputs on the options page", () => {
		expect(optionsHtml).toContain(`id="${CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID}"`);
		expect(optionsHtml).toContain(
			`id="${CHANNELS_SUBMIT_BATCH_INTERVAL_MIN_INPUT_ID}"`,
		);
		expect(optionsHtml).toContain(`id="${CHANNELS_BATCH_SETTINGS_SAVED_STATUS_ID}"`);
		expect(optionsHtml).toContain('src="./dist/options.js"');
	});

	it("keeps batch inputs and the settings link out of the popup", () => {
		expect(popupHtml).not.toContain(CHANNELS_SUBMIT_BATCH_SIZE_INPUT_ID);
		expect(popupHtml).not.toContain(CHANNELS_SUBMIT_BATCH_INTERVAL_MIN_INPUT_ID);
		expect(popupHtml).not.toContain(`id="${OPEN_OPTIONS_BUTTON_ID}"`);
	});

	it("registers the options page in the manifest", () => {
		expect(manifest.options_ui?.page).toBe("options.html");
		expect(manifest.options_ui?.open_in_tab).toBe(true);
	});
});
