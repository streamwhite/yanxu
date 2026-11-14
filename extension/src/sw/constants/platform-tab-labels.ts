import { Platform, type PlatformId } from "@yanxu/domain";

export const PLATFORM_TAB_LABELS: Record<PlatformId, string> = {
	[Platform.Bilibili]: "bilibili",
	[Platform.Douyin]: "douyin",
	[Platform.Channels]: "channels (视频号)",
};
