import type { PlatformId } from "@yanxu/domain";
import { waitForPlatformVideoFileInput } from "./wait-for-platform-video-file-input.js";

export async function resolveVideoFileInputForPlatform(
	platform: PlatformId,
	uploadArea: HTMLElement | null,
): Promise<HTMLInputElement | null> {
	return waitForPlatformVideoFileInput(platform, uploadArea);
}
