import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { waitMs } from "../../content/wait-ms.js";
import { assignFileToInput } from "../../content/dom.js";
import { blurActiveFieldBeforeCover } from "../../content/blur-active-field-before-cover.js";
import {
	CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
	CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
} from "./channels-cover-selectors.js";
import {
	channelsCoverDialogLooksApplied,
	channelsCoverWrapLooksUserUploaded,
} from "./channels-cover-upload-looks-applied.js";
import { confirmChannelsVerticalCoverDialog } from "./confirm-channels-vertical-cover-dialog.js";
import { findChannelsVerticalCoverConfirmButton } from "./find-channels-vertical-cover-confirm-button.js";
import { findChannelsCoverTriggerInWrap } from "./find-channels-cover-trigger.js";
import { waitForChannelsCoverFileInput } from "./wait-for-channels-cover-file-input.js";
import { waitForChannelsCoverUploadReady } from "./wait-for-channels-cover-upload-ready.js";
import { waitForChannelsCoverUploadClickTarget } from "./wait-for-channels-cover-upload-click-target.js";
import { waitForChannelsCoverUploadDialog } from "./wait-for-channels-cover-upload-dialog.js";
import { waitForChannelsCoverUploadDialogAbsent } from "./wait-for-channels-cover-upload-dialog-absent.js";
import { clickChannelsUseMaterialButton } from "./click-channels-use-material-button.js";
import {
	CHANNELS_COVER_ASSIGN_RETRIES,
	CHANNELS_COVER_ASSIGN_RETRY_MS,
	CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS,
	CHANNELS_BEFORE_COVER_SETTLE_MS,
	CHANNELS_COVER_POST_CLICK_SETTLE_MS,
	CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/channels-cover-timing.js";

const CHANNELS_COVER_RETRY_APPLIED_WAIT_MS = 2_000 as const;
const CHANNELS_AFTER_VERTICAL_COVER_CLOSE_SETTLE_MS = 500 as const;

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
	if (!input) return false;

	tryAssignViaFileInput(input, file);

	if (!inputHasAssignedFile(input, file) && uploadTarget) {
		assignFileViaDragDrop(uploadTarget, file);
		tryAssignViaFileInput(input, file);
	}

	if (
		await waitForChannelsCoverUploadReady(
			document,
			dialog,
			wrapSelector,
			CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS,
		)
	) {
		await waitMs(CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS);
		return true;
	}

	for (let attempt = 1; attempt < CHANNELS_COVER_ASSIGN_RETRIES; attempt += 1) {
		await waitMs(CHANNELS_COVER_ASSIGN_RETRY_MS);

		if (uploadTarget) {
			dispatchClick(uploadTarget);
			await waitMs(CHANNELS_COVER_POST_CLICK_SETTLE_MS);
		}

		tryAssignViaFileInput(input, file);
		if (uploadTarget) assignFileViaDragDrop(uploadTarget, file);

		const waitMsForAttempt =
			attempt === CHANNELS_COVER_ASSIGN_RETRIES - 1
				? CHANNELS_COVER_UPLOAD_APPLIED_WAIT_MS
				: CHANNELS_COVER_RETRY_APPLIED_WAIT_MS;
		if (await waitForChannelsCoverUploadReady(document, dialog, wrapSelector, waitMsForAttempt)) {
			await waitMs(CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS);
			return true;
		}
	}

	return (
		channelsCoverWrapLooksUserUploaded(document, wrapSelector) ||
		channelsCoverDialogLooksApplied(dialog)
	);
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

async function confirmAndCloseVerticalCoverDialog(root: ParentNode): Promise<boolean> {
	const confirmed = await confirmChannelsVerticalCoverDialog(root);
	if (!confirmed) return false;

	await waitMs(CHANNELS_COVER_POST_CLICK_SETTLE_MS);
	return waitForChannelsCoverUploadDialogAbsent(root);
}

async function applyChannelsHorizontalCoverViaUseMaterial(root: ParentNode): Promise<boolean> {
	const trigger = findChannelsCoverTriggerInWrap(root, CHANNELS_HORIZON_COVER_WRAP_SELECTOR);
	if (!trigger) return false;

	clickChannelsCoverTrigger(trigger);
	await waitMs(CHANNELS_COVER_POST_CLICK_SETTLE_MS);

	const clicked = await clickChannelsUseMaterialButton(document);
	if (!clicked) return false;

	await waitMs(CHANNELS_AFTER_COVER_ASSIGN_SETTLE_MS);
	return true;
}

async function commitVerticalCoverDialog(
	root: ParentNode,
	hasHorizontalFile: boolean,
): Promise<boolean> {
	// Horizontal flow: the horizon 编辑 reopens its own popover, so a confirm-less
	// dialog after a successful vertical upload can be left for replacement.
	if (
		hasHorizontalFile &&
		channelsCoverWrapLooksUserUploaded(root, CHANNELS_VERTICAL_COVER_WRAP_SELECTOR) &&
		!findChannelsVerticalCoverConfirmButton(document)
	) {
		return true;
	}

	return confirmAndCloseVerticalCoverDialog(root);
}

/** Vertical upload + 确认, then horizontal: -4x3 file direct to .horizon-cover-wrap, else 使用素材. */
export async function applyChannelsCoverViaModal(
	root: ParentNode,
	file: File,
	horizontalFile?: File,
): Promise<boolean> {
	if (!findChannelsCoverTriggerInWrap(root, CHANNELS_VERTICAL_COVER_WRAP_SELECTOR)) return false;

	blurActiveFieldBeforeCover();
	await waitMs(CHANNELS_BEFORE_COVER_SETTLE_MS);

	const verticalOk = await applyChannelsCoverForWrap(
		root,
		CHANNELS_VERTICAL_COVER_WRAP_SELECTOR,
		file,
	);
	if (!verticalOk) return false;

	if (!(await commitVerticalCoverDialog(root, horizontalFile !== undefined))) return false;

	await waitMs(CHANNELS_AFTER_VERTICAL_COVER_CLOSE_SETTLE_MS);

	if (horizontalFile) {
		return applyChannelsCoverForWrap(
			root,
			CHANNELS_HORIZON_COVER_WRAP_SELECTOR,
			horizontalFile,
		);
	}

	return applyChannelsHorizontalCoverViaUseMaterial(root);
}

