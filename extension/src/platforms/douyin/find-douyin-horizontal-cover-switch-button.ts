import { queryAllDeep } from "../../content/query-all-deep.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";

export const DOUYIN_HORIZONTAL_COVER_SWITCH_TEXT = "设置横封面" as const;

export function findDouyinHorizontalCoverSwitchButton(root: ParentNode): HTMLElement | null {
	for (const button of queryAllDeep(root, "button")) {
		if (!(button instanceof HTMLButtonElement)) continue;
		if (!isElementVisible(button)) continue;
		if (!normalizeUiText(button.textContent).includes(DOUYIN_HORIZONTAL_COVER_SWITCH_TEXT)) continue;
		return button;
	}
	return null;
}
