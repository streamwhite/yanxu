import { selectChannelsMarkTagValue } from "../platforms/channels/select-channels-mark-tag-value.js";

export async function applyChannelsMarkTag(
	root: ParentNode,
	targetValue: string,
): Promise<boolean> {
	return selectChannelsMarkTagValue(root, targetValue);
}

export function channelsMarkTagMissingLabel(targetValue: string): string {
	return `视频标注 → ${targetValue}`;
}
