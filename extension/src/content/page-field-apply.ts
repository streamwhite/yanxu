import type { PageField } from "@auto-upload/domain";

export const PageFieldKind = {
	Text: "text",
	RadioByLabel: "radioByLabel",
	PartitionSelect: "partitionSelect",
	TagsEnter: "tagsEnter",
} as const;

export type PageFieldKind = (typeof PageFieldKind)[keyof typeof PageFieldKind];

export type ApplyPageField = PageField & {
	kind?: PageFieldKind;
	selectorFallbacks?: readonly string[];
	radioGroupSelectors?: readonly string[];
	tagValues?: readonly string[];
};
