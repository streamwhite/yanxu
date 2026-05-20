import { assignFileViaDragDrop } from "./assign-file-via-drag-drop.js";
import { clickCoverUploadArea } from "./click-cover-upload-area.js";
import { COVER_UPLOAD_CLICK_SETTLE_MS } from "./constants/cover-modal-timing.js";
import { findCoverFileInputNearUploadArea } from "./find-cover-file-input.js";
import { findCoverTrigger } from "./find-cover-trigger.js";
import { inputHasAssignedFile } from "./input-has-assigned-file.js";
import { assignFileToInput } from "./dom.js";
import { waitForCoverFileInputNearUploadArea } from "./wait-for-cover-file-input.js";
import { waitForCoverModalUploadArea } from "./wait-for-cover-modal-upload-area.js";
import { waitMs } from "./wait-ms.js";

function tryAssignViaFileInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

export async function applyCoverViaModal(root: ParentNode, file: File): Promise<boolean> {
	const trigger = findCoverTrigger(root);
	if (!trigger) return false;

	trigger.click();

	const uploadArea = await waitForCoverModalUploadArea(root);
	if (!uploadArea) return false;

	clickCoverUploadArea(uploadArea);
	await waitMs(COVER_UPLOAD_CLICK_SETTLE_MS);

	const input = await waitForCoverFileInputNearUploadArea(uploadArea);
	if (input && tryAssignViaFileInput(input, file)) return true;

	assignFileViaDragDrop(uploadArea, file);
	await waitMs(COVER_UPLOAD_CLICK_SETTLE_MS);

	const inputAfterDrop = findCoverFileInputNearUploadArea(uploadArea);
	if (inputAfterDrop && tryAssignViaFileInput(inputAfterDrop, file)) return true;

	return false;
}
