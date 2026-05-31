import { collectVideoFileInputs } from "../../content/collect-video-file-inputs.js";
import { findVideoFileInputNearUploadArea } from "../../content/find-video-file-input-near-upload-area.js";
import { CHANNELS_VIDEO_FILE_INPUT_SELECTORS } from "./channels-selectors.js";
import { findChannelsFileInputLoose } from "./find-channels-file-input-loose.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { isChannelsVideoFileInput } from "./is-channels-video-file-input.js";

export function findChannelsVideoFileInput(root: ParentNode): HTMLInputElement | null {
	const loose = findChannelsFileInputLoose(root);
	if (loose) return loose;

	const uploadArea = findChannelsVideoUploadArea(root);
	if (uploadArea) {
		const nearArea = findVideoFileInputNearUploadArea(uploadArea);
		if (nearArea) return nearArea;
	}

	for (const input of collectVideoFileInputs(root, CHANNELS_VIDEO_FILE_INPUT_SELECTORS)) {
		if (isChannelsVideoFileInput(input, root)) return input;
	}

	return null;
}
