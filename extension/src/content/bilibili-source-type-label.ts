import {
	BILIBILI_SOURCE_TYPE_LABEL_ORIGINAL,
	BILIBILI_SOURCE_TYPE_LABEL_REPOST,
	type BilibiliSourceType,
} from "@yanxu/domain";

const SOURCE_TYPE_LABEL_BY_VALUE: Record<BilibiliSourceType, string> = {
	original: BILIBILI_SOURCE_TYPE_LABEL_ORIGINAL,
	repost: BILIBILI_SOURCE_TYPE_LABEL_REPOST,
};

export function bilibiliSourceTypeToUiLabel(sourceType: BilibiliSourceType): string {
	return SOURCE_TYPE_LABEL_BY_VALUE[sourceType];
}
