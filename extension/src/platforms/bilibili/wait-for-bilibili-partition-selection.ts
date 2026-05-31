import { waitMs } from "../../content/wait-ms.js";
import {
	BILIBILI_PARTITION_DROPDOWN_POLL_MS,
	BILIBILI_PARTITION_SELECTION_WAIT_MS,
} from "./constants/bilibili-partition-timing.js";
import { isBilibiliPartitionDropdownOpen } from "./list-bilibili-partition-dropdown-options.js";
import { partitionLabelsMatch } from "./partition-label-matches.js";
import { readBilibiliPartitionSelection } from "./read-bilibili-partition-selection.js";

function selectionLooksCommitted(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): boolean {
	const current = readBilibiliPartitionSelection(controller);
	if (!current || !partitionLabelsMatch(current, targetValue)) return false;
	return !isBilibiliPartitionDropdownOpen(root, controller);
}

export async function waitForBilibiliPartitionSelection(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<boolean> {
	const deadline = Date.now() + BILIBILI_PARTITION_SELECTION_WAIT_MS;

	while (Date.now() < deadline) {
		if (selectionLooksCommitted(root, controller, targetValue)) return true;
		await waitMs(BILIBILI_PARTITION_DROPDOWN_POLL_MS);
	}

	return selectionLooksCommitted(root, controller, targetValue);
}
