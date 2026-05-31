import { Platform, type PlatformId } from "./platform";

export const PLATFORM_UPLOAD_URL_HINTS: Record<PlatformId, readonly string[]> = {
	[Platform.Bilibili]: ["/platform/upload/video", "/platform/upload", "/upload/video"],
	[Platform.Douyin]: [
		"/creator-micro/content/post/video",
		"/creator-micro/content/upload",
		"/content/post/video",
		"/content/upload",
	],
	[Platform.Channels]: ["/platform/post/create", "/post/create"],
};

export function scorePlatformUploadUrl(url: string, platform: PlatformId): number {
	const hints = PLATFORM_UPLOAD_URL_HINTS[platform];
	let score = 0;
	for (const [index, hint] of hints.entries()) {
		if (!url.includes(hint)) continue;
		score = hints.length - index;
		break;
	}
	return score;
}
