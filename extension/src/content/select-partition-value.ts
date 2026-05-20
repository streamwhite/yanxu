import { BILIBILI_PARTITION_SECTION_TITLE } from "@auto-upload/domain";
import { findPartitionSelectController } from "./find-partition-select-controller.js";
import { pickPartitionOption } from "./pick-partition-option.js";
import { readPartitionSelection } from "./read-partition-selection.js";
import { normalizeUiText } from "./normalize-ui-text.js";

export function selectPartitionValue(root: ParentNode, value: string): boolean {
	const controller = findPartitionSelectController(root);
	if (!controller) return false;

	const target = normalizeUiText(value);
	const current = readPartitionSelection(controller);
	if (current === target) return true;

	controller.click();

	const option = pickPartitionOption(root, controller, target);
	if (!option) return false;

	option.click();
	return normalizeUiText(readPartitionSelection(controller)) === target;
}

export function partitionFieldMissingLabel(value: string): string {
	return `${BILIBILI_PARTITION_SECTION_TITLE} → ${value}`;
}
