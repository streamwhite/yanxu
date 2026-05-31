import { getJobPlatform, Platform, type CanonicalJob } from "@auto-upload/domain";
import { platformSupportsCoverUpload } from "../platforms/platform-supports-cover-upload.js";
import { FIELDS_READY_POLL_MS, FIELDS_READY_WAIT_MS } from "./constants/cover-modal-timing.js";
import { blurActiveFieldBeforeCover } from "./blur-active-field-before-cover.js";
import { dismissUiBeforeCover } from "./dismiss-ui-before-cover.js";
import { findCoverTriggerForPlatform } from "./find-cover-trigger-for-platform.js";
import { waitMs } from "./wait-ms.js";

function prepareUiBeforeCoverPoll(platform: string): void {
	if (platform === Platform.Channels) {
		blurActiveFieldBeforeCover();
		return;
	}
	dismissUiBeforeCover();
}

export async function waitForFieldsReadyBeforeCover(job: CanonicalJob): Promise<void> {
	const platform = getJobPlatform(job);
	if (!platformSupportsCoverUpload(platform)) return;

	const deadline = Date.now() + FIELDS_READY_WAIT_MS;

	while (Date.now() < deadline) {
		prepareUiBeforeCoverPoll(platform);
		if (findCoverTriggerForPlatform(document, platform)) return;
		await waitMs(FIELDS_READY_POLL_MS);
	}

	throw new Error(`cover_trigger_not_ready:${platform}`);
}
