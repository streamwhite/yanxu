import { Platform, type PlatformId } from "./platform";

export const PLATFORM_UPLOAD_PAGE_URLS: Record<PlatformId, string> = {
	[Platform.Bilibili]: "https://member.bilibili.com/platform/upload/video/frame",
	[Platform.Douyin]: "https://creator.douyin.com/creator-micro/content/upload",
	[Platform.Channels]: "https://channels.weixin.qq.com/platform/post/create",
};
