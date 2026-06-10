import {
	CHANNELS_DOCUMENT_VISIBLE_WAIT_MS,
	CHANNELS_VIDEO_FILE_INPUT_WAIT_MS,
} from "../constants/platform-video-upload-timing.js";
import { waitMs } from "../../content/wait-ms.js";
import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { assignFileToInput } from "../../content/dom.js";
import { waitForDocumentVisible } from "../../content/wait-for-document-visible.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import { findChannelsFileInputLoose } from "./find-channels-file-input-loose.js";
import { findChannelsVideoFileInput } from "./find-channels-video-file-input.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { channelsVideoAttached } from "./channels-video-upload-verified.js";
import { channelsVideoUploadInProgress } from "./channels-video-upload-in-progress.js";
import { channelsVideoUploadVerified } from "./channels-video-upload-verified.js";
import { channelsVideoReadyForCover } from "./channels-video-ready-for-cover.js";
import { waitForChannelsVideoUploadComplete } from "./wait-for-channels-video-upload-complete.js";

const CHANNELS_CENTER_SELECTOR = ".center" as const;

function dragFileOntoTargets(targets: readonly HTMLElement[], file: File): void {
	for (const target of targets) {
		assignFileViaDragDrop(target, file);
	}
}

function collectDragTargets(uploadArea: HTMLElement): HTMLElement[] {
	const targets: HTMLElement[] = [uploadArea];
	const center = uploadArea.querySelector(CHANNELS_CENTER_SELECTOR);
	if (center instanceof HTMLElement) targets.push(center);
	return targets;
}

function inputAcceptsFile(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file) || inputHasAnyFile(input);
}

async function waitForVideoAttached(root: ParentNode, file: File): Promise<boolean> {
	const deadline = Date.now() + CHANNELS_VIDEO_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		if (channelsVideoAttached(root, file) || channelsVideoUploadInProgress(root)) return true;
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return channelsVideoAttached(root, file) || channelsVideoUploadInProgress(root);
}

/** Assign video once — never drag/click again while WeChat is already uploading. */
async function assignChannelsVideoOnce(root: ParentNode, file: File): Promise<boolean> {
	if (channelsVideoAttached(root, file) || channelsVideoUploadInProgress(root)) {
		return true;
	}

	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return false;

	const loose = findChannelsFileInputLoose(root);
	if (loose && inputAcceptsFile(loose, file)) return true;

	const strictInput = findChannelsVideoFileInput(root);
	if (strictInput && inputAcceptsFile(strictInput, file)) return true;

	dragFileOntoTargets(collectDragTargets(uploadArea), file);
	return waitForVideoAttached(root, file);
}

export async function applyChannelsVideoFile(file: File): Promise<boolean> {
	const root = document;

	await waitForDocumentVisible(CHANNELS_DOCUMENT_VISIBLE_WAIT_MS);

	if (channelsVideoUploadVerified(root, file)) {
		return true;
	}

	let assignStarted =
		channelsVideoAttached(root, file) || channelsVideoUploadInProgress(root);
	if (!assignStarted) {
		assignStarted = await assignChannelsVideoOnce(root, file);
	}

	if (assignStarted) {
		await waitForChannelsVideoUploadComplete(root);
	}

	return channelsVideoReadyForCover(root, file);
}
