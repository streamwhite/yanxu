import { Platform, type PlatformId } from "../constants/platform";
import { isAllowedPlatformUrl } from "./is-allowed-platform-url";

const DETECTION_ORDER: readonly PlatformId[] = [
	Platform.Channels,
	Platform.Douyin,
	Platform.Bilibili,
];

export function detectPlatformFromUrl(url: string): PlatformId | null {
	for (const platform of DETECTION_ORDER) {
		if (isAllowedPlatformUrl(url, platform)) return platform;
	}
	return null;
}
