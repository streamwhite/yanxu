import { CHANNELS_SUBMIT_LABEL } from "../constants/platform-submit-labels.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";

const CHANNELS_SUBMIT_SELECTORS = [
	".weui-desktop-btn_wrp button.weui-desktop-btn_primary",
	"button.weui-desktop-btn_primary",
] as const;

export function findChannelsSubmitControl(root: ParentNode): HTMLElement | null {
	for (const selector of CHANNELS_SUBMIT_SELECTORS) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (normalizeUiText(candidate.textContent) !== CHANNELS_SUBMIT_LABEL) continue;
			if (!isElementVisible(candidate)) continue;
			return candidate;
		}
	}

	return null;
}
