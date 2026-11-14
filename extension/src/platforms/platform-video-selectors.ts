import { Platform, type PlatformId } from "@yanxu/domain";
import { BILIBILI_VIDEO_FILE_INPUT_SELECTORS } from "../content/bilibili-selectors.js";
import { CHANNELS_VIDEO_FILE_INPUT_SELECTORS } from "./channels/channels-selectors.js";
import { DOUYIN_VIDEO_FILE_INPUT_SELECTORS } from "./douyin/douyin-selectors.js";

const VIDEO_SELECTORS_BY_PLATFORM: Record<PlatformId, readonly string[]> = {
	[Platform.Bilibili]: BILIBILI_VIDEO_FILE_INPUT_SELECTORS,
	[Platform.Douyin]: DOUYIN_VIDEO_FILE_INPUT_SELECTORS,
	[Platform.Channels]: CHANNELS_VIDEO_FILE_INPUT_SELECTORS,
};

export function videoFileInputSelectorsForPlatform(platform: PlatformId): readonly string[] {
	return VIDEO_SELECTORS_BY_PLATFORM[platform];
}
