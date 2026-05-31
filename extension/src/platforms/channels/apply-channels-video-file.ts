import {
	CHANNELS_VIDEO_UPLOAD_RETRY_MS,
	CHANNELS_VIDEO_UPLOAD_MAX_ATTEMPTS,
} from "../constants/platform-video-upload-timing.js";
import { waitMs } from "../../content/wait-ms.js";
import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { assignFileToInput } from "../../content/dom.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { inputHasAnyFile } from "../../content/input-has-any-file.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { CHANNELS_VIDEO_FILE_INPUT_WAIT_MS } from "../constants/platform-video-upload-timing.js";
import { VIDEO_FILE_INPUT_POLL_MS } from "../../content/constants/video-upload-timing.js";
import { findChannelsFileInputLoose } from "./find-channels-file-input-loose.js";
import { findChannelsVideoFileInput } from "./find-channels-video-file-input.js";
import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";
import { channelsVideoAlreadyUploaded } from "./channels-video-already-uploaded.js";
import { channelsVideoUploadLooksStarted } from "./channels-video-upload-looks-started.js";
import { waitForChannelsVideoUploadSettled } from "./wait-for-channels-video-upload-settled.js";

const CHANNELS_ADD_ICON_SELECTOR = ".add-icon" as const;
const CHANNELS_CENTER_SELECTOR = ".center" as const;

function dispatchPointerActivate(element: HTMLElement): void {
	const init: MouseEventInit = { bubbles: true, cancelable: true };
	element.dispatchEvent(new MouseEvent("mousedown", init));
	element.dispatchEvent(new MouseEvent("mouseup", init));
}

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

function clickUploadAreaTrigger(uploadArea: HTMLElement): void {
	const addIcon = uploadArea.querySelector(CHANNELS_ADD_ICON_SELECTOR);
	if (addIcon instanceof HTMLElement) {
		dispatchPointerActivate(addIcon);
		return;
	}

	const center = uploadArea.querySelector(CHANNELS_CENTER_SELECTOR);
	if (center instanceof HTMLElement) {
		dispatchPointerActivate(center);
		return;
	}

	dispatchPointerActivate(uploadArea);
}

function clickUploadAreaTriggerWithNativeClick(uploadArea: HTMLElement): void {
	const addIcon = uploadArea.querySelector(CHANNELS_ADD_ICON_SELECTOR);
	if (addIcon instanceof HTMLElement) {
		dispatchClick(addIcon);
		return;
	}

	dispatchClick(uploadArea);
}

function inputAcceptsFile(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file) || inputHasAnyFile(input);
}

async function waitForAssignOrUploadStarted(root: ParentNode, file: File): Promise<boolean> {
	const deadline = Date.now() + CHANNELS_VIDEO_FILE_INPUT_WAIT_MS;

	while (Date.now() < deadline) {
		const input = findChannelsFileInputLoose(root) ?? findChannelsVideoFileInput(root);
		if (input && inputAcceptsFile(input, file)) return true;
		if (channelsVideoUploadLooksStarted(root)) return true;
		await waitMs(VIDEO_FILE_INPUT_POLL_MS);
	}

	return false;
}

async function attemptApplyChannelsVideoFile(root: ParentNode, file: File): Promise<boolean> {
	if (channelsVideoAlreadyUploaded(root)) return true;

	const uploadArea = findChannelsVideoUploadArea(root);
	if (!uploadArea) return false;

	const loose = findChannelsFileInputLoose(root);
	if (loose && inputAcceptsFile(loose, file)) return true;

	if (await waitForAssignOrUploadStarted(root, file)) return true;

	dragFileOntoTargets(collectDragTargets(uploadArea), file);
	if (await waitForAssignOrUploadStarted(root, file)) return true;

	clickUploadAreaTrigger(uploadArea);
	if (await waitForAssignOrUploadStarted(root, file)) return true;

	clickUploadAreaTriggerWithNativeClick(uploadArea);
	return waitForAssignOrUploadStarted(root, file);
}

export async function applyChannelsVideoFile(file: File): Promise<boolean> {
	const root = document;

	if (channelsVideoAlreadyUploaded(root)) {
		return true;
	}

	for (let attempt = 0; attempt < CHANNELS_VIDEO_UPLOAD_MAX_ATTEMPTS; attempt += 1) {
		if (await attemptApplyChannelsVideoFile(root, file)) {
			if (await waitForChannelsVideoUploadSettled(root)) return true;
			if (channelsVideoAlreadyUploaded(root)) return true;
		}
		if (attempt < CHANNELS_VIDEO_UPLOAD_MAX_ATTEMPTS - 1) {
			await waitMs(CHANNELS_VIDEO_UPLOAD_RETRY_MS);
		}
	}

	return channelsVideoAlreadyUploaded(root);
}
