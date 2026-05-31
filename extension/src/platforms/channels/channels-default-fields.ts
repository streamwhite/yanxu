import { BilibiliSourceType, type CanonicalJob } from "@auto-upload/domain";
import type { ApplyPageField } from "../../content/page-field-apply.js";
import { PageFieldKind } from "../../content/page-field-apply.js";
import {
	CHANNELS_DESCRIPTION_SELECTORS,
	CHANNELS_ORIGINAL_DECLARE_HINT,
	CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR,
	CHANNELS_SHORT_TITLE_SELECTORS,
	CHANNELS_TITLE_SELECTORS,
} from "./channels-selectors.js";

function primarySelector(selectors: readonly string[]): string {
	const first = selectors[0];
	if (!first) throw new Error("selector_list_empty");
	return first;
}

export function buildDefaultChannelsPageFields(job: CanonicalJob): ApplyPageField[] {
	if (job.jobVersion !== 2) return [];
	const block = job.channels;
	if (!block) return [];

	const fields: ApplyPageField[] = [];
	const { title, description, shortTitle, sourceType } = block;

	if (sourceType === BilibiliSourceType.Original) {
		fields.push({
			kind: PageFieldKind.OriginalDeclareCheckbox,
			locator: { css: CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR },
			originalDeclareLabelHint: CHANNELS_ORIGINAL_DECLARE_HINT,
			value: BilibiliSourceType.Original,
		});
	}

	if (title) {
		fields.push({
			locator: { css: primarySelector(CHANNELS_TITLE_SELECTORS) },
			selectorFallbacks: CHANNELS_TITLE_SELECTORS,
			value: title,
			fieldLabel: "标题",
		});
	}

	if (description !== undefined) {
		fields.push({
			locator: { css: primarySelector(CHANNELS_DESCRIPTION_SELECTORS) },
			selectorFallbacks: CHANNELS_DESCRIPTION_SELECTORS,
			value: description,
			fieldLabel: "描述",
		});
	}

	if (shortTitle) {
		fields.push({
			locator: { css: primarySelector(CHANNELS_SHORT_TITLE_SELECTORS) },
			selectorFallbacks: CHANNELS_SHORT_TITLE_SELECTORS,
			value: shortTitle,
			fieldLabel: "短标题",
		});
	}

	return fields;
}
