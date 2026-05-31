export const Platform = {
	Bilibili: "bilibili",
	Douyin: "douyin",
	Channels: "channels",
} as const;

export type PlatformId = (typeof Platform)[keyof typeof Platform];

export const PLATFORM_IDS = [Platform.Bilibili, Platform.Douyin, Platform.Channels] as const;
