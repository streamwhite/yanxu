import { Platform } from "@yanxu/domain";
import { assignFileViaDragDrop } from "../../content/assign-file-via-drag-drop.js";
import { clickCoverUploadArea } from "../../content/click-cover-upload-area.js";
import { dispatchClick } from "../../content/dispatch-click.js";
import { findCoverTriggerForPlatform } from "../../content/find-cover-trigger-for-platform.js";
import { inputHasAssignedFile } from "../../content/input-has-assigned-file.js";
import { isElementVisible } from "../../content/is-element-visible.js";
import { isImageFileInput } from "../../content/is-image-file-input.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import { waitForCoverModalUploadArea } from "../../content/wait-for-cover-modal-upload-area.js";
import { assignFileToInput } from "../../content/dom.js";
import { waitMs } from "../../content/wait-ms.js";
import { COVER_MODAL_POLL_MS, COVER_MODAL_WAIT_MS } from "../../content/constants/cover-modal-timing.js";

const SYNC_RATIO_LABEL_TEXT = "双比例同步改动" as const;
const UPLOAD_AREA_SELECTOR = ".upload-area" as const;
const SYNC_RATIO_WAIT_MS = 3_000 as const;

function findSyncRatioLabel(root: ParentNode): HTMLElement | null {
	for (const label of queryAllDeep(root, ".sync label, label.sync-checkbox")) {
		if (!(label instanceof HTMLElement)) continue;
		if (normalizeUiText(label.textContent).includes(SYNC_RATIO_LABEL_TEXT)) return label;
	}
	return null;
}

function findCoverEditorRoot(root: ParentNode): ParentNode {
	const label = findSyncRatioLabel(root);
	if (!label) return root;

	let node = label.parentElement;
	while (node) {
		if (findCoverImageInputs(node).length > 0) return node;
		node = node.parentElement;
	}
	return root;
}

function findCoverImageInputs(root: ParentNode): HTMLInputElement[] {
	return queryAllDeep(root, 'input[type="file"]').filter(
		(element): element is HTMLInputElement =>
			element instanceof HTMLInputElement && isImageFileInput(element),
	);
}

function findUploadArea(root: ParentNode): HTMLElement | null {
	for (const candidate of queryAllDeep(root, UPLOAD_AREA_SELECTOR)) {
		if (candidate instanceof HTMLElement && isElementVisible(candidate)) return candidate;
	}
	return null;
}

function clickBilibiliCoverTrigger(trigger: HTMLElement): void {
	if (typeof trigger.scrollIntoView === "function") {
		trigger.scrollIntoView({ block: "center", inline: "nearest" });
	}
	const editText = trigger.querySelector(".edit-text");
	dispatchClick(editText instanceof HTMLElement ? editText : trigger);
}

async function waitForCoverEditorReady(
	root: ParentNode,
	inputsBeforeOpen: ReadonlySet<HTMLInputElement>,
): Promise<boolean> {
	const deadline = Date.now() + COVER_MODAL_WAIT_MS;
	while (Date.now() < deadline) {
		if (findCoverImageInputs(root).some((input) => !inputsBeforeOpen.has(input))) return true;
		if (findSyncRatioLabel(root)) return true;
		if (findUploadArea(root)) return true;
		await waitMs(COVER_MODAL_POLL_MS);
	}
	return false;
}

async function waitForSyncRatioLabel(root: ParentNode): Promise<HTMLElement | null> {
	const deadline = Date.now() + SYNC_RATIO_WAIT_MS;
	while (Date.now() < deadline) {
		const label = findSyncRatioLabel(root);
		if (label) return label;
		await waitMs(COVER_MODAL_POLL_MS);
	}
	return null;
}

/** Bilibili keeps separate 4:3 and 16:9 covers; sync copies one upload to both ratios. */
export async function enableBilibiliSyncRatio(root: ParentNode): Promise<void> {
	const label = await waitForSyncRatioLabel(root);
	if (!label) return;

	const input = label.querySelector('input[type="checkbox"]');
	if (input instanceof HTMLInputElement) {
		if (input.checked) return;
		input.click();
		if (input.checked) return;
	}

	if (label.classList.contains("checked")) return;
	label.click();
}

function tryAssignViaFileInput(input: HTMLInputElement, file: File): boolean {
	assignFileToInput(input, file);
	return inputHasAssignedFile(input, file);
}

async function assignViaUploadArea(scope: ParentNode, file: File): Promise<boolean> {
	const uploadArea = await waitForCoverModalUploadArea(scope, undefined, Platform.Bilibili);
	if (!uploadArea) return false;

	clickCoverUploadArea(uploadArea);
	const input = findCoverImageInputs(uploadArea)[0];
	if (input && tryAssignViaFileInput(input, file)) return true;

	assignFileViaDragDrop(uploadArea, file);
	const inputAfterDrop = findCoverImageInputs(uploadArea)[0];
	return inputAfterDrop !== undefined && tryAssignViaFileInput(inputAfterDrop, file);
}

async function assignBilibiliCoverFile(root: ParentNode, file: File): Promise<boolean> {
	const editorRoot = findCoverEditorRoot(root);
	const directInput = findCoverImageInputs(editorRoot)[0];
	if (directInput && tryAssignViaFileInput(directInput, file)) return true;

	return assignViaUploadArea(root, file);
}

/**
 * Bilibili's cover editor holds 4:3 and 16:9 variants. Upload the 4:3 file when
 * available and sync both ratios, leaving the editor open for review.
 */
export async function applyBilibiliCoverViaModal(
	root: ParentNode,
	file: File,
	horizontalFile?: File,
): Promise<boolean> {
	const trigger = findCoverTriggerForPlatform(root, Platform.Bilibili);
	if (!trigger) return false;

	const inputsBeforeOpen = new Set(findCoverImageInputs(root));
	clickBilibiliCoverTrigger(trigger);
	if (!(await waitForCoverEditorReady(root, inputsBeforeOpen))) return false;

	await enableBilibiliSyncRatio(root);
	return assignBilibiliCoverFile(root, horizontalFile ?? file);
}
