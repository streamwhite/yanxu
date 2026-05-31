import { findCheckboxLabelByTextHint } from "../../content/find-checkbox-label-by-text-hint.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	CHANNELS_DECLARE_ORIGINAL_CHECKBOX_SELECTOR,
	CHANNELS_ORIGINAL_DECLARE_FULL_HINT,
	CHANNELS_ORIGINAL_DECLARE_HINT,
	CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR,
} from "./channels-selectors.js";

export function findChannelsOriginalDeclareLabel(root: ParentNode): HTMLElement | null {
	for (const container of queryAllDeep(root, CHANNELS_DECLARE_ORIGINAL_CHECKBOX_SELECTOR)) {
		for (const label of queryAllDeep(container, CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR)) {
			if (label.textContent?.includes(CHANNELS_ORIGINAL_DECLARE_HINT)) return label;
		}
	}

	return (
		findCheckboxLabelByTextHint(
			root,
			CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR,
			CHANNELS_ORIGINAL_DECLARE_FULL_HINT,
		) ??
		findCheckboxLabelByTextHint(
			root,
			CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR,
			CHANNELS_ORIGINAL_DECLARE_HINT,
		)
	);
}
