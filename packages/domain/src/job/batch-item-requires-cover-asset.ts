import type { BatchJobItem } from "../schema/batch-job.js";

export function batchItemRequiresCoverAsset(item: BatchJobItem): boolean {
	return item.includeCover !== false;
}
