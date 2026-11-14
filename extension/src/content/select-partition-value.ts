import { BILIBILI_PARTITION_SECTION_TITLE } from "@yanxu/domain";
import { selectBilibiliPartitionValue } from "../platforms/bilibili/select-bilibili-partition-value.js";

export async function selectPartitionValue(root: ParentNode, value: string): Promise<boolean> {
	return selectBilibiliPartitionValue(root, value);
}

export function partitionFieldMissingLabel(value: string): string {
	return `${BILIBILI_PARTITION_SECTION_TITLE} → ${value}`;
}
