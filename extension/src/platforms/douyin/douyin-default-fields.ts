import type { CanonicalJob } from "@auto-upload/domain";
import type { ApplyPageField } from "../../content/page-field-apply.js";
import { DOUYIN_DESCRIPTION_SELECTORS, DOUYIN_TITLE_SELECTORS } from "./douyin-selectors.js";

function primarySelector(selectors: readonly string[]): string {
	const first = selectors[0];
	if (!first) throw new Error("selector_list_empty");
	return first;
}

export function buildDefaultDouyinPageFields(job: CanonicalJob): ApplyPageField[] {
	if (job.jobVersion !== 2) return [];
	const block = job.douyin;
	if (!block) return [];

	const fields: ApplyPageField[] = [];
	const { title, description } = block;

	if (title) {
		fields.push({
			locator: { css: primarySelector(DOUYIN_TITLE_SELECTORS) },
			selectorFallbacks: DOUYIN_TITLE_SELECTORS,
			value: title,
			fieldLabel: "标题",
		});
	}

	if (description !== undefined) {
		fields.push({
			locator: { css: primarySelector(DOUYIN_DESCRIPTION_SELECTORS) },
			selectorFallbacks: DOUYIN_DESCRIPTION_SELECTORS,
			value: description,
			fieldLabel: "简介",
		});
	}

	return fields;
}
