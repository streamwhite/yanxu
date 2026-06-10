import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { waitMs } from "../../content/wait-ms.js";
import { assignFileToInput } from "../../content/dom.js";
import {
	DOUYIN_COVER_ASSIGN_RETRIES,
	DOUYIN_COVER_ASSIGN_RETRY_MS,
	DOUYIN_COVER_POST_CLICK_SETTLE_MS,
	DOUYIN_COVER_UPLOAD_APPLIED_WAIT_MS,
} from "./constants/douyin-cover-timing.js";
import { douyinCoverUploadLooksApplied } from "./douyin-cover-upload-looks-applied.js";
import { findDouyinCoverTrigger } from "./find-douyin-cover-trigger.js";
import { findDouyinHorizontalCoverSwitchButton } from "./find-douyin-horizontal-cover-switch-button.js";
import { DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR } from "./douyin-cover-selectors.js";
import { resolveDouyinCoverDragArea } from "./resolve-douyin-cover-drag-area.js";
import { waitForDouyinCoverFileInput } from "./wait-for-douyin-cover-file-input.js";
import { waitForDouyinCoverModalBody } from "./wait-for-douyin-cover-modal-body.js";
import { waitForDouyinCoverUploadClickTarget } from "./wait-for-douyin-cover-upload-click-target.js";
import { waitForDouyinCoverUploadApplied } from "./wait-for-douyin-cover-upload-applied.js";

const DOUYIN_COVER_RETRY_APPLIED_WAIT_MS = 2_000 as const;
const DOUYIN_AFTER_HORIZONTAL_SWITCH_SETTLE_MS = 500 as const;

function tryAssignViaFileInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

function clickDouyinCoverTrigger(trigger: HTMLElement): void {
	if (typeof trigger.scrollIntoView === "function") {
		trigger.scrollIntoView({ block: "center", inline: "nearest" });
	}
	dispatchClick(trigger);
}

function clickDouyinCoverUploadTarget(dragArea: HTMLElement, clickTarget: HTMLElement): void {
	dispatchClick(dragArea);
	dispatchClick(clickTarget);
}

async function assignDouyinCoverInModal(
	modal: ParentNode,
	file: File,
	uploadRoot: HTMLElement,
	clickTarget: HTMLElement,
): Promise<boolean> {
	clickDouyinCoverUploadTarget(uploadRoot, clickTarget);
	await waitMs(DOUYIN_COVER_POST_CLICK_SETTLE_MS);

	assignFileViaDragDrop(uploadRoot, file);

	const semiUpload = uploadRoot.closest(DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR);
	if (semiUpload instanceof HTMLElement) {
		assignFileViaDragDrop(semiUpload, file);
	}

	const input = await waitForDouyinCoverFileInput(document, uploadRoot);
	const inputAssigned = Boolean(input && tryAssignViaFileInput(input, file));

	if (!inputAssigned) {
		assignFileViaDragDrop(clickTarget, file);
		if (input) tryAssignViaFileInput(input, file);
	}

	if (douyinCoverUploadLooksApplied(modal)) return true;
	if (await waitForDouyinCoverUploadApplied(modal)) return true;

	for (let attempt = 1; attempt < DOUYIN_COVER_ASSIGN_RETRIES; attempt += 1) {
		await waitMs(DOUYIN_COVER_ASSIGN_RETRY_MS);
		clickDouyinCoverUploadTarget(uploadRoot, clickTarget);
		await waitMs(DOUYIN_COVER_POST_CLICK_SETTLE_MS);

		const retryInput = await waitForDouyinCoverFileInput(document, uploadRoot);
		if (retryInput) tryAssignViaFileInput(retryInput, file);
		assignFileViaDragDrop(uploadRoot, file);

		if (douyinCoverUploadLooksApplied(modal)) return true;

		const waitMsForAttempt =
			attempt === DOUYIN_COVER_ASSIGN_RETRIES - 1
				? DOUYIN_COVER_UPLOAD_APPLIED_WAIT_MS
				: DOUYIN_COVER_RETRY_APPLIED_WAIT_MS;
		const deadline = Date.now() + waitMsForAttempt;
		while (Date.now() < deadline) {
			if (douyinCoverUploadLooksApplied(modal)) return true;
			await waitMs(50);
		}
	}

	return douyinCoverUploadLooksApplied(modal);
}

/** Vertical cover in modal, switch to horizontal via 设置横封面 (same cover, modal stays open). */
export async function applyDouyinCoverViaModal(root: ParentNode, file: File): Promise<boolean> {
	const trigger = findDouyinCoverTrigger(root, "vertical");
	if (!trigger) return false;

	clickDouyinCoverTrigger(trigger);

	const modal = await waitForDouyinCoverModalBody(root);
	const clickTarget = modal ? await waitForDouyinCoverUploadClickTarget(modal) : null;
	const dragArea = modal ? resolveDouyinCoverDragArea(modal, clickTarget) : null;
	const uploadRoot = dragArea ?? clickTarget;

	if (!modal || !uploadRoot || !clickTarget) return false;

	const verticalOk = await assignDouyinCoverInModal(modal, file, uploadRoot, clickTarget);
	if (!verticalOk) return false;

	const switchBtn = findDouyinHorizontalCoverSwitchButton(modal);
	if (!switchBtn) return false;

	dispatchClick(switchBtn);
	await waitMs(DOUYIN_AFTER_HORIZONTAL_SWITCH_SETTLE_MS);

	return true;
}
