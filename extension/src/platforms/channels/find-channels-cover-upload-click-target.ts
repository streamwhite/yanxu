import { queryAllDeep } from "../../content/query-all-deep.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { CHANNELS_COVER_UPLOAD_CLICK_SELECTORS } from "./channels-cover-selectors.js";
import { findChannelsCoverFileInput } from "./find-channels-cover-file-input.js";

export function findChannelsCoverUploadClickTarget(scope: ParentNode): HTMLElement | null {
	for (const selector of CHANNELS_COVER_UPLOAD_CLICK_SELECTORS) {
		for (const candidate of queryAllDeep(scope, selector)) {
			if (!(candidate instanceof HTMLElement)) continue;
			if (!isElementVisible(candidate)) continue;
			return candidate;
		}
	}

	const input = findChannelsCoverFileInput(scope);
	const label = input?.labels?.[0];
	if (label instanceof HTMLElement && isElementVisible(label)) return label;

	return input;
}
