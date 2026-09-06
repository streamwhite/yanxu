import type { PageField } from "@auto-upload/domain";

export const PageFieldKind = {
	Text: "text",
	RadioByLabel: "radioByLabel",
	OriginalDeclareCheckbox: "originalDeclareCheckbox",
	PartitionSelect: "partitionSelect",
	TagsEnter: "tagsEnter",
	BilibiliCreativeStatement: "bilibiliCreativeStatement",
	ChannelsMarkTag: "channelsMarkTag",
} as const;

export type PageFieldKind = (typeof PageFieldKind)[keyof typeof PageFieldKind];

export type ApplyPageField = PageField & {
	kind?: PageFieldKind;
	selectorFallbacks?: readonly string[];
	radioGroupSelectors?: readonly string[];
	originalDeclareLabelHint?: string;
	tagValues?: readonly string[];
	statementOption?: string;
	statementAuth?: string;
	markTagOption?: string;
	fieldLabel?: string;
};
