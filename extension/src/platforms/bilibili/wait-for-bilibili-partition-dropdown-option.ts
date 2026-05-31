import { waitMs } from "../../content/wait-ms.js";
import {
	BILIBILI_PARTITION_DROPDOWN_POLL_MS,
	BILIBILI_PARTITION_DROPDOWN_WAIT_MS,
} from "./constants/bilibili-partition-timing.js";
import { findBilibiliPartitionDropdownOption } from "./list-bilibili-partition-dropdown-options.js";

export async function waitForBilibiliPartitionDropdownOption(
	root: ParentNode,
	controller: HTMLElement,
	targetValue: string,
): Promise<HTMLElement | null> {
	const deadline = Date.now() + BILIBILI_PARTITION_DROPDOWN_WAIT_MS;

	while (Date.now() < deadline) {
		const option = findBilibiliPartitionDropdownOption(root, controller, targetValue);
		if (option) return option;
		await waitMs(BILIBILI_PARTITION_DROPDOWN_POLL_MS);
	}

	return null;
}
