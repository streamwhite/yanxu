import { Platform, type PlatformId } from "@auto-upload/domain";
import { applyChannelsCoverViaModal } from "../platforms/channels/apply-channels-cover-via-modal.js";
import { applyDouyinCoverViaModal } from "../platforms/douyin/apply-douyin-cover-via-modal.js";
import { assignFileViaDragDrop } from "./assign-file-via-drag-drop.js";
import { clickCoverTrigger } from "./click-cover-trigger.js";
import { clickCoverUploadArea } from "./click-cover-upload-area.js";
import { findCoverTriggerForPlatform } from "./find-cover-trigger-for-platform.js";
import { inputHasAssignedFile } from "./input-has-assigned-file.js";
import { assignFileToInput } from "./dom.js";
import { tryAssignCoverViaVisibleImageInputs } from "./try-assign-cover-via-visible-image-inputs.js";
import { waitForCoverFileInputNearUploadArea } from "./wait-for-cover-file-input.js";
import { waitForCoverModalUploadArea } from "./wait-for-cover-modal-upload-area.js";

function tryAssignViaFileInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

export async function applyCoverViaModal(
	root: ParentNode,
	file: File,
	platform: PlatformId,
	horizontalFile?: File,
): Promise<boolean> {
	if (platform === Platform.Douyin) {
		return applyDouyinCoverViaModal(root, file, horizontalFile);
	}

	if (platform === Platform.Channels) {
		return applyChannelsCoverViaModal(root, file, horizontalFile);
	}


	const trigger = findCoverTriggerForPlatform(root, platform);
	if (!trigger) return false;

	await clickCoverTrigger(trigger, platform);

	const uploadArea = await waitForCoverModalUploadArea(document, undefined, platform);

	if (uploadArea) {
		clickCoverUploadArea(uploadArea);

		const input = await waitForCoverFileInputNearUploadArea(uploadArea);
		if (input && tryAssignViaFileInput(input, file)) return true;

		assignFileViaDragDrop(uploadArea, file);

		const inputAfterDrop = await waitForCoverFileInputNearUploadArea(uploadArea);
		if (inputAfterDrop && tryAssignViaFileInput(inputAfterDrop, file)) return true;
	}

	return tryAssignCoverViaVisibleImageInputs(document, file);
}
