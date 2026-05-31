import { Platform } from "../constants/platform";
import { isAllowedPlatformUrl } from "./is-allowed-platform-url.js";

export function isAllowedBilibiliMatchUrl(url: string): boolean {
	return isAllowedPlatformUrl(url, Platform.Bilibili);
}
