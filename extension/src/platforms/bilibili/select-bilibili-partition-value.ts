import { dispatchClick } from "../../content/dispatch-click.js";
import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { waitMs } from "../../content/wait-ms.js";
import {
	BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS,
	BILIBILI_PARTITION_PRIMARY_SETTLE_MS,
} from "./constants/bilibili-partition-timing.js";
import { findBilibiliPartitionSelectController } from "./find-bilibili-partition-select-controller.js";
import {
	findBilibiliPartitionDropdownOption,
	isBilibiliPartitionDropdownOpen,
	listBilibiliPartitionDropdownOptions,
} from "./list-bilibili-partition-dropdown-options.js";
import { partitionLabelsMatch } from "./partition-label-matches.js";
import { readBilibiliPartitionSelection } from "./read-bilibili-partition-selection.js";
import { resolveBilibiliPartitionClickTarget } from "./resolve-bilibili-partition-click-target.js";
import { tryAssignBilibiliPartitionDisplayText } from "./try-assign-bilibili-partition-display-text.js";
import { waitForBilibiliPartitionDropdownOption } from "./wait-for-bilibili-partition-dropdown-option.js";
import { waitForBilibiliPartitionSelection } from "./wait-for-bilibili-partition-selection.js";

function clickPartitionOption(element: HTMLElement): void {
	dispatchClick(resolveBilibiliPartitionClickTarget(element));
}

function selectionMatches(root: ParentNode, controller: HTMLElement, targetValue: string): boolean {
	const current = readBilibiliPartitionSelection(controller);
	if (!current || !partitionLabelsMatch(current, targetValue)) return false;
	return !isBilibiliPartitionDropdownOpen(root, controller);
}

async function waitForCommittedSelection(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<boolean> {
	return waitForBilibiliPartitionSelection(root, controller, targetValue);
}

async function pickListedTargetOption(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<boolean> {
	const option = findBilibiliPartitionDropdownOption(root, controller, targetValue);
	if (!option) return false;

	clickPartitionOption(option);
	await waitMs(BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS);
	return waitForCommittedSelection(root, controller, targetValue);
}

async function pollForTargetOption(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<boolean> {
	const option = await waitForBilibiliPartitionDropdownOption(root, controller, targetValue);
	if (!option) return false;

	clickPartitionOption(option);
	await waitMs(BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS);
	return waitForCommittedSelection(root, controller, targetValue);
}

async function tryPickTargetAfterPrimary(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<boolean> {
	if (await pickListedTargetOption(root, controller, targetValue)) {
		return true;
	}

	return pollForTargetOption(root, controller, targetValue);
}

async function browsePrimaryPartitionsForTarget(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
	initialPrimaries?: HTMLElement[],
): Promise<boolean> {
	const triedLabels = new Set<string>();
	let primaries = initialPrimaries ?? listBilibiliPartitionDropdownOptions(root, controller);

	if (primaries.length === 0) {
		dispatchClick(controller);
		await waitMs(BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS);
		primaries = listBilibiliPartitionDropdownOptions(root, controller);
	}

	for (const primary of primaries) {
		const label = normalizeUiText(primary.textContent);
		if (!label || triedLabels.has(label)) continue;
		triedLabels.add(label);

		clickPartitionOption(primary);
		await waitMs(BILIBILI_PARTITION_PRIMARY_SETTLE_MS);

		if (await tryPickTargetAfterPrimary(root, controller, targetValue)) {
			return true;
		}

		if (selectionMatches(root, controller, targetValue)) {
			return true;
		}

		dispatchClick(controller);
		await waitMs(BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS);
	}

	return false;
}

export async function selectBilibiliPartitionValue(
	root: ParentNode,
	value: string,
): Promise<boolean> {
	const controller = findBilibiliPartitionSelectController(root);
	if (!controller) return false;

	const target = normalizeUiText(value);
	if (selectionMatches(root, controller, target)) return true;

	if (tryAssignBilibiliPartitionDisplayText(root, target)) return true;

	dispatchClick(controller);
	await waitMs(BILIBILI_PARTITION_AFTER_PICK_SETTLE_MS);

	if (await pickListedTargetOption(root, controller, target)) {
		return true;
	}

	const listedOptions = listBilibiliPartitionDropdownOptions(root, controller);
	if (listedOptions.length > 0) {
		return browsePrimaryPartitionsForTarget(root, controller, target, listedOptions);
	}

	if (await pollForTargetOption(root, controller, target)) {
		return true;
	}

	return browsePrimaryPartitionsForTarget(root, controller, target);
}
