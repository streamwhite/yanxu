import { Platform, type PlatformId } from "@auto-upload/domain";
import { clickBilibiliVideoUploadTrigger } from "./bilibili/bilibili-video-upload-trigger.js";
import { clickChannelsVideoUploadTrigger } from "./channels/channels-video-upload-trigger.js";
import { clickDouyinVideoUploadTrigger } from "./douyin/douyin-video-upload-trigger.js";

export type VideoUploadTriggerResult = {
	uploadArea: HTMLElement | null;
};

export function clickVideoUploadTriggerForPlatform(
	root: ParentNode,
	platform: PlatformId,
): VideoUploadTriggerResult {
	if (platform === Platform.Bilibili) {
		return { uploadArea: clickBilibiliVideoUploadTrigger(root) };
	}

	if (platform === Platform.Douyin) {
		return { uploadArea: clickDouyinVideoUploadTrigger(root) };
	}

	if (platform === Platform.Channels) {
		return { uploadArea: clickChannelsVideoUploadTrigger(root) };
	}

	return { uploadArea: null };
}
