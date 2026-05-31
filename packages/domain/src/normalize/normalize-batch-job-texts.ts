import type { BatchJob } from "../schema/batch-job";
import { sanitizeText } from "../text/sanitize-text";
import type { PageField } from "../schema/field-locator";

function normalizePageFields(pageFields: PageField[] | undefined): PageField[] | undefined {
	if (!pageFields) return undefined;
	return pageFields.map((field) => ({
		...field,
		value: sanitizeText(field.value),
	}));
}

export function normalizeBatchJobTexts(batch: BatchJob): BatchJob {
	return {
		...batch,
		assetsParentFolder: sanitizeText(batch.assetsParentFolder),
		items: batch.items.map((item) => ({
			...item,
			name: sanitizeText(item.name),
			...(item.description === undefined ? {} : { description: sanitizeText(item.description) }),
			...(item.tags === undefined ? {} : { tags: item.tags.map((tag) => sanitizeText(tag)) }),
			...(item.partition === undefined ? {} : { partition: sanitizeText(item.partition) }),
			pageFields: normalizePageFields(item.pageFields),
		})),
	};
}
