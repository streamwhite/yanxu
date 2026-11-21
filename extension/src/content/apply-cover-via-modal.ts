import { Platform, type PlatformId } from "@yanxu/domain";
import { applyBilibiliCoverViaModal } from "../platforms/bilibili/apply-bilibili-cover-via-modal.js";
import { applyChannelsCoverViaModal } from "../platforms/channels/apply-channels-cover-via-modal.js";
import { applyDouyinCoverViaModal } from "../platforms/douyin/apply-douyin-cover-via-modal.js";

export async function applyCoverViaModal(
	root: ParentNode,
	file: File,
	platform: PlatformId,
	horizontalFile?: File,
): Promise<boolean> {
	if (platform === Platform.Bilibili) {
		return applyBilibiliCoverViaModal(root, file, horizontalFile);
	}
	if (platform === Platform.Douyin) {
		return applyDouyinCoverViaModal(root, file, horizontalFile);
	}
	if (platform === Platform.Channels) {
		return applyChannelsCoverViaModal(root, file, horizontalFile);
	}
	return false;
}
