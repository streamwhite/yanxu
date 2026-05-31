import { Platform, type PlatformId } from "@auto-upload/domain";
import { findBilibiliCoverTrigger } from "../platforms/bilibili/find-bilibili-cover-trigger.js";
import { findChannelsCoverTrigger } from "../platforms/channels/find-channels-cover-trigger.js";
import { findDouyinCoverTrigger } from "../platforms/douyin/find-douyin-cover-trigger.js";

export function findCoverTriggerForPlatform(
	root: ParentNode,
	platform: PlatformId,
): HTMLElement | null {
	if (platform === Platform.Bilibili) return findBilibiliCoverTrigger(root);
	if (platform === Platform.Douyin) return findDouyinCoverTrigger(root);
	if (platform === Platform.Channels) return findChannelsCoverTrigger(root);
	return null;
}
