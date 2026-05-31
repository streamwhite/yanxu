import type { PlatformId } from "../constants/platform";
import type { BatchJob } from "../schema/batch-job";

export function listBatchItemIndicesForPlatform(batch: BatchJob, platform: PlatformId): number[] {
	return batch.items
		.map((item, index) => ({ item, index }))
		.filter(({ item }) => item.targets.includes(platform))
		.map(({ index }) => index);
}
