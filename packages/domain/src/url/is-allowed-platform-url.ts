import { BILIBILI_CONTENT_SCRIPT_MATCHES } from "../constants/bilibili";
import { CHANNELS_CONTENT_SCRIPT_MATCHES } from "../constants/channels";
import { DOUYIN_CONTENT_SCRIPT_MATCHES } from "../constants/douyin";
import { Platform, type PlatformId } from "../constants/platform";
import { matchUrlAgainstPatterns } from "./match-url-against-patterns";

const PLATFORM_URL_PATTERNS: Record<PlatformId, readonly string[]> = {
	[Platform.Bilibili]: BILIBILI_CONTENT_SCRIPT_MATCHES,
	[Platform.Douyin]: DOUYIN_CONTENT_SCRIPT_MATCHES,
	[Platform.Channels]: CHANNELS_CONTENT_SCRIPT_MATCHES,
};

export function isAllowedPlatformUrl(url: string, platform: PlatformId): boolean {
	const patterns = PLATFORM_URL_PATTERNS[platform];
	return matchUrlAgainstPatterns(url, patterns);
}
