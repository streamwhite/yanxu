import { Platform, type PlatformId } from "@auto-upload/domain";
import {
	BILIBILI_VIDEO_UPLOAD_SETTLE_MS,
	CHANNELS_VIDEO_UPLOAD_SETTLE_MS,
	DOUYIN_VIDEO_UPLOAD_SETTLE_MS,
} from "./constants/platform-video-upload-timing.js";

const SETTLE_MS_BY_PLATFORM: Record<PlatformId, number> = {
	[Platform.Bilibili]: BILIBILI_VIDEO_UPLOAD_SETTLE_MS,
	[Platform.Douyin]: DOUYIN_VIDEO_UPLOAD_SETTLE_MS,
	[Platform.Channels]: CHANNELS_VIDEO_UPLOAD_SETTLE_MS,
};

export function platformVideoUploadSettleMs(platform: PlatformId): number {
	return SETTLE_MS_BY_PLATFORM[platform];
}
