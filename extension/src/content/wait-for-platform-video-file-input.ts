import { Platform, type PlatformId } from "@auto-upload/domain";
import { findBilibiliVideoFileInput } from "../platforms/bilibili/find-bilibili-video-file-input.js";
import { findChannelsVideoFileInput } from "../platforms/channels/find-channels-video-file-input.js";
import { waitForChannelsVideoFileInput } from "../platforms/channels/wait-for-channels-video-file-input.js";
import { videoFileInputSelectorsForPlatform } from "../platforms/platform-video-selectors.js";
import {
	VIDEO_FILE_INPUT_POLL_MS,
	VIDEO_FILE_INPUT_WAIT_MS,
} from "./constants/video-upload-timing.js";
import { findVideoFileInput } from "./find-video-file-input.js";
import { waitMs } from "./wait-ms.js";
import { waitForVideoFileInputNearUploadArea } from "./wait-for-video-file-input-near-upload-area.js";

function findPlatformVideoFileInputNow(
	platform: PlatformId,
	root: ParentNode,
): HTMLInputElement | null {
	if (platform === Platform.Bilibili) return findBilibiliVideoFileInput(root);
	if (platform === Platform.Channels) return findChannelsVideoFileInput(root);
	return findVideoFileInput(root, videoFileInputSelectorsForPlatform(platform));
}

async function waitForGenericPlatformVideoFileInput(
	platform: PlatformId,
	uploadArea: HTMLElement | null,
): Promise<HTMLInputElement | null> {
	if (uploadArea) {
		const scoped = await waitForVideoFileInputNearUploadArea(uploadArea);
		if (scoped) return scoped;
	}

	const deadline = Date.now() + VIDEO_FILE_INPUT_WAIT_MS;
	while (Date.now() < deadline) {
		const found = findPlatformVideoFileInputNow(platform, document);
		if (found) return found;
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return null;
}

export async function waitForPlatformVideoFileInput(
	platform: PlatformId,
	uploadArea: HTMLElement | null,
): Promise<HTMLInputElement | null> {
	if (platform === Platform.Channels) {
		const existing = findChannelsVideoFileInput(document);
		if (existing) return existing;

		if (uploadArea) {
			const scoped = await waitForVideoFileInputNearUploadArea(uploadArea);
			if (scoped) return scoped;
		}

		return waitForChannelsVideoFileInput(document);
	}

	return waitForGenericPlatformVideoFileInput(platform, uploadArea);
}
