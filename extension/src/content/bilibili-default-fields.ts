import type { CanonicalJob } from "@yanxu/domain";
import {
	BILIBILI_DEFAULT_CREATIVE_STATEMENT_AUTH,
	BILIBILI_DEFAULT_CREATIVE_STATEMENT_OPTION,
} from "@yanxu/domain";
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
	const { title, description, tags, sourceType, partition, creativeStatement, creativeStatementAuth } =
		job.bilibili;

	fields.push({
		kind: PageFieldKind.BilibiliCreativeStatement,
		locator: { css: ".statement-content .bcc-select" },
		value: creativeStatement ?? BILIBILI_DEFAULT_CREATIVE_STATEMENT_OPTION,
		statementOption: creativeStatement ?? BILIBILI_DEFAULT_CREATIVE_STATEMENT_OPTION,
		statementAuth: creativeStatementAuth ?? BILIBILI_DEFAULT_CREATIVE_STATEMENT_AUTH,
	});

	if (sourceType) {
		fields.push({
			kind: PageFieldKind.RadioByLabel,
			locator: { css: primarySelector(BILIBILI_SOURCE_TYPE_GROUP_SELECTORS) },
			radioGroupSelectors: BILIBILI_SOURCE_TYPE_GROUP_SELECTORS,
			value: bilibiliSourceTypeToUiLabel(sourceType),
			fieldLabel: `来源 → ${bilibiliSourceTypeToUiLabel(sourceType)}`,
		});
	}

	if (partition) {
		fields.push({
			kind: PageFieldKind.PartitionSelect,
			locator: { css: ".select-controller" },
			value: partition,
			fieldLabel: `分区 → ${partition}`,
		});
	}

	if (title) {
		fields.push({
			locator: { css: primarySelector(BILIBILI_TITLE_SELECTORS) },
			selectorFallbacks: BILIBILI_TITLE_SELECTORS,
			value: title,
			fieldLabel: "标题",
		});
	}

	if (description) {
		fields.push({
			locator: { css: primarySelector(BILIBILI_DESCRIPTION_SELECTORS) },
			selectorFallbacks: BILIBILI_DESCRIPTION_SELECTORS,
			value: description,
			fieldLabel: "简介",
		});
	}

	if (tags && tags.length > 0) {
		const tagValues = tags.map((tag) => tag.trim()).filter(Boolean);
		if (tagValues.length > 0) {
			fields.push({
				kind: PageFieldKind.TagsEnter,
				locator: { css: primarySelector(BILIBILI_TAG_SELECTORS) },
				selectorFallbacks: BILIBILI_TAG_SELECTORS,
				value: tagValues.join(", "),
				tagValues,
				fieldLabel: `标签 (${String(tagValues.length)})`,
			});
		}
	}

	return fields;
}
