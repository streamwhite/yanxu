import type { PlatformId } from "@yanxu/domain";
import { Platform } from "@yanxu/domain";
import { COVER_MODAL_OPEN_RETRIES } from "./constants/cover-modal-timing.js";
import { blurActiveFieldBeforeCover } from "./blur-active-field-before-cover.js";
import { dismissUiBeforeCover } from "./dismiss-ui-before-cover.js";
import { applyCoverViaModal } from "./apply-cover-via-modal.js";

function prepareUiBeforeCoverAttempt(platform: PlatformId): void {
	if (platform === Platform.Channels) {
		blurActiveFieldBeforeCover();
		return;
	}
	dismissUiBeforeCover();
}

export async function applyCoverWithRetry(
	file: File,
	platform: PlatformId,
	horizontalFile?: File,
): Promise<boolean> {
	for (let attempt = 0; attempt < COVER_MODAL_OPEN_RETRIES; attempt++) {
		prepareUiBeforeCoverAttempt(platform);
		if (await applyCoverViaModal(document, file, platform, horizontalFile)) return true;
	}

	return false;
}
