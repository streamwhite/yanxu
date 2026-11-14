import { getJobPlatform, Platform, type CanonicalJob } from "@yanxu/domain";
import { BILIBILI_TITLE_SELECTORS } from "./bilibili-selectors.js";
import { CHANNELS_FIELDS_READY_WAIT_MS } from "../platforms/constants/platform-video-upload-timing.js";
import { channelsPostUploadFormReady } from "../platforms/channels/channels-post-upload-form-ready.js";
import { FIELDS_READY_POLL_MS, FIELDS_READY_WAIT_MS } from "./constants/cover-modal-timing.js";
import { pickFirstVisibleElementDeep } from "./dom.js";
import { waitMs } from "./wait-ms.js";

function isBilibiliTitleFieldReady(root: ParentNode): boolean {
	return pickFirstVisibleElementDeep(root, BILIBILI_TITLE_SELECTORS) !== null;
}

function isChannelsFieldsReady(root: ParentNode): boolean {
	return channelsPostUploadFormReady(root);
}

function fieldsReadyWaitMs(platform: string): number {
	if (platform === Platform.Channels) return CHANNELS_FIELDS_READY_WAIT_MS;
	return FIELDS_READY_WAIT_MS;
}

function isPlatformFieldsReady(platform: string, root: ParentNode): boolean {
	if (platform === Platform.Bilibili) return isBilibiliTitleFieldReady(root);
	if (platform === Platform.Channels) return isChannelsFieldsReady(root);
	return true;
}

export async function waitForPageFieldsReady(job: CanonicalJob): Promise<void> {
	const platform = getJobPlatform(job);
	if (platform !== Platform.Bilibili && platform !== Platform.Channels) return;

	const deadline = Date.now() + fieldsReadyWaitMs(platform);

	while (Date.now() < deadline) {
		if (isPlatformFieldsReady(platform, document)) return;
		await waitMs(FIELDS_READY_POLL_MS);
	}

	throw new Error(`page_fields_targets_not_ready:${platform}`);
}
