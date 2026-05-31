import { normalizeUiText } from "../../content/normalize-ui-text.js";
import { assignBilibiliPartitionDisplayText } from "./assign-bilibili-partition-display-text.js";
import { findBilibiliPartitionDisplayElement } from "./find-bilibili-partition-display-element.js";
import { findBilibiliPartitionSelectController } from "./find-bilibili-partition-select-controller.js";
import { partitionLabelsMatch } from "./partition-label-matches.js";
import { readBilibiliPartitionSelection } from "./read-bilibili-partition-selection.js";

export function tryAssignBilibiliPartitionDisplayText(
	root: ParentNode,
	targetValue: string,
): boolean {
	const container = findBilibiliPartitionSelectController(root);
	if (!container) return false;

	const target = normalizeUiText(targetValue);
	const current = readBilibiliPartitionSelection(container);
	if (current && partitionLabelsMatch(current, target)) return true;

	const display = findBilibiliPartitionDisplayElement(container);
	if (!display) return false;

	assignBilibiliPartitionDisplayText(display, target);

	const after = readBilibiliPartitionSelection(container);
	return Boolean(after && partitionLabelsMatch(after, target));
}
