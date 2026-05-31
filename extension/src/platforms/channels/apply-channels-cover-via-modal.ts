import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { waitMs } from "../../content/wait-ms.js";
import { assignFileToInput } from "../../content/dom.js";
import { blurActiveFieldBeforeCover } from "../../content/blur-active-field-before-cover.js";
import { CHANNELS_VERTICAL_COVER_WRAP_SELECTOR } from "./channels-cover-selectors.js";
import { channelsCoverWrapLooksUserUploaded } from "./channels-cover-upload-looks-applied.js";
import { findChannelsCoverTriggerInWrap } from "./find-channels-cover-trigger.js";
import { waitForChannelsCoverFileInput } from "./wait-for-channels-cover-file-input.js";
import { waitForChannelsCoverUploadApplied } from "./wait-for-channels-cover-upload-applied.js";
import { waitForChannelsCoverUploadClickTarget } from "./wait-for-channels-cover-upload-click-target.js";
import { waitForChannelsCoverUploadDialog } from "./wait-for-channels-cover-upload-dialog.js";
import {
	CHANNELS_COVER_ASSIGN_RETRIES,
	CHANNELS_COVER_ASSIGN_RETRY_MS,
	CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS,
	CHANNELS_BEFORE_COVER_SETTLE_MS,
	CHANNELS_COVER_POST_CLICK_SETTLE_MS,
	CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/channels-cover-timing.js";

const CHANNELS_COVER_RETRY_APPLIED_WAIT_MS = 2_000 as const;

async function settleAfterCoverAssign(): Promise<void> {
	await waitMs(CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS);
}

function tryAssignViaFileInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

function clickChannelsCoverTrigger(trigger: HTMLElement): void {
	if (typeof trigger.scrollIntoView === "function") {
		trigger.scrollIntoView({ block: "center", inline: "nearest" });
	}
	dispatchClick(trigger);
}

async function assignChannelsCoverInDialog(
	dialog: ParentNode,
	file: File,
	uploadTarget: HTMLElement | null,
	wrapSelector: string,
): Promise<boolean> {
	if (uploadTarget) {
		dispatchClick(uploadTarget);
		await waitMs(CHANNELS_COVER_POST_CLICK_SETTLE_MS);
	}

	const input =
		(await waitForChannelsCoverFileInput(dialog)) ??
		(await waitForChannelsCoverFileInput(document));
	const inputAssigned = Boolean(input && tryAssignViaFileInput(input, file));

	if (!inputAssigned && uploadTarget) {
		assignFileViaDragDrop(uploadTarget, file);
		if (input) tryAssignViaFileInput(input, file);
	}

	if (input && inputHasAssignedFile(input, file)) {
		await settleAfterCoverAssign();
		return true;
	}

	for (let attempt = 1; attempt < CHANNELS_COVER_ASSIGN_RETRIES; attempt += 1) {
		await waitMs(CHANNELS_COVER_ASSIGN_RETRY_MS);

		if (uploadTarget) {
			dispatchClick(uploadTarget);
			await waitMs(CHANNELS_COVER_POST_CLICK_SETTLE_MS);
		}

		const retryInput =
			(await waitForChannelsCoverFileInput(dialog)) ??
			(await waitForChannelsCoverFileInput(document));
		if (retryInput) tryAssignViaFileInput(retryInput, file);
		if (uploadTarget) assignFileViaDragDrop(uploadTarget, file);

		if (input && inputHasAssignedFile(input, file)) {
			await settleAfterCoverAssign();
			return true;
		}

		const waitMsForAttempt =
			attempt === CHANNELS_COVER_ASSIGN_RETRIES - 1
				? CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS
				: CHANNELS_COVER_RETRY_APPLIED_WAIT_MS;
		if (await waitForChannelsCoverUploadApplied(document, waitMsForAttempt)) {
			if (channelsCoverWrapLooksUserUploaded(document, wrapSelector)) return true;
		}
	}

	return channelsCoverWrapLooksUserUploaded(document, wrapSelector);
}

async function applyChannelsCoverForWrap(
	root: ParentNode,
	wrapSelector: string,
	file: File,
): Promise<boolean> {
	const trigger = findChannelsCoverTriggerInWrap(root, wrapSelector);
	if (!trigger) return false;

	clickChannelsCoverTrigger(trigger);

	const dialog = await waitForChannelsCoverUploadDialog(document);
	if (!dialog) return false;

	const uploadTarget = await waitForChannelsCoverUploadClickTarget(dialog);
	return assignChannelsCoverInDialog(dialog, file, uploadTarget, wrapSelector);
}

/** Vertical cover only; horizontal cover is uploaded manually on 视频号. */
export async function applyChannelsCoverViaModal(root: ParentNode, file: File): Promise<boolean> {
	const wrapSelector = CHANNELS_VERTICAL_COVER_WRAP_SELECTOR;
	if (!findChannelsCoverTriggerInWrap(root, wrapSelector)) return false;

	blurActiveFieldBeforeCover();
	await waitMs(CHANNELS_BEFORE_COVER_SETTLE_MS);

	return applyChannelsCoverForWrap(root, wrapSelector, file);
}
