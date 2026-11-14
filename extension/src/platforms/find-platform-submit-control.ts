import { Platform, type PlatformId } from "@yanxu/domain";
import { findBilibiliSubmitControl } from "./bilibili/find-bilibili-submit-control.js";
import { findChannelsSubmitControl } from "./channels/find-channels-submit-control.js";
import { findDouyinSubmitControl } from "./douyin/find-douyin-submit-control.js";

export function findPlatformSubmitControl(
	root: ParentNode,
	platform: PlatformId,
): HTMLElement | null {
	if (platform === Platform.Bilibili) return findBilibiliSubmitControl(root);
	if (platform === Platform.Douyin) return findDouyinSubmitControl(root);
	if (platform === Platform.Channels) return findChannelsSubmitControl(root);
	return null;
}
