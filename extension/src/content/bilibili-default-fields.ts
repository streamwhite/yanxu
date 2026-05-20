import type { CanonicalJob } from "@auto-upload/domain";
import {
	BILIBILI_DESCRIPTION_SELECTORS,
	BILIBILI_SOURCE_TYPE_GROUP_SELECTORS,
	BILIBILI_TAG_SELECTORS,
	BILIBILI_TITLE_SELECTORS,
} from "./bilibili-selectors.js";
import { bilibiliSourceTypeToUiLabel } from "./bilibili-source-type-label.js";
import { PageFieldKind, type ApplyPageField } from "./page-field-apply.js";

function primarySelector(selectors: readonly string[]): string {
	const first = selectors[0];
	if (!first) throw new Error("selector_list_empty");
	return first;
}

export function buildDefaultBilibiliPageFields(job: CanonicalJob): ApplyPageField[] {
	if (!job.bilibili) return [];

	const fields: ApplyPageField[] = [];
	const { title, description, tags, sourceType, partition } = job.bilibili;

	if (sourceType) {
		fields.push({
			kind: PageFieldKind.RadioByLabel,
			locator: { css: primarySelector(BILIBILI_SOURCE_TYPE_GROUP_SELECTORS) },
			radioGroupSelectors: BILIBILI_SOURCE_TYPE_GROUP_SELECTORS,
			value: bilibiliSourceTypeToUiLabel(sourceType),
		});
	}

	if (partition) {
		fields.push({
			kind: PageFieldKind.PartitionSelect,
			locator: { css: ".select-controller" },
			value: partition,
		});
	}

	if (title) {
		fields.push({
			locator: { css: primarySelector(BILIBILI_TITLE_SELECTORS) },
			selectorFallbacks: BILIBILI_TITLE_SELECTORS,
			value: title,
		});
	}

	if (description !== undefined) {
		fields.push({
			locator: { css: primarySelector(BILIBILI_DESCRIPTION_SELECTORS) },
			selectorFallbacks: BILIBILI_DESCRIPTION_SELECTORS,
			value: description,
		});
	}

	if (tags && tags.length > 0) {
		const tagValues = tags.map((tag) => tag.trim()).filter(Boolean);
		fields.push({
			kind: PageFieldKind.TagsEnter,
			locator: { css: primarySelector(BILIBILI_TAG_SELECTORS) },
			selectorFallbacks: BILIBILI_TAG_SELECTORS,
			value: tagValues.join(", "),
			tagValues,
		});
	}

	return fields;
}

export function resolvePageFieldsForJob(job: CanonicalJob): ApplyPageField[] {
	const custom: ApplyPageField[] = (job.pageFields ?? []).map((field) => ({ ...field }));
	const defaults = buildDefaultBilibiliPageFields(job);
	return [...defaults, ...custom];
}
