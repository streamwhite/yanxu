export const BilibiliSourceType = {
	Original: "original",
	Repost: "repost",
} as const;

export type BilibiliSourceType = (typeof BilibiliSourceType)[keyof typeof BilibiliSourceType];

export const BILIBILI_SOURCE_TYPE_LABEL_ORIGINAL = "自制" as const;

export const BILIBILI_SOURCE_TYPE_LABEL_REPOST = "转载" as const;
