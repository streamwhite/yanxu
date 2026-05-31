import { BilibiliSourceType } from "../constants/bilibili-source-type";
import { Platform, type PlatformId } from "../constants/platform";
import type { BatchJob } from "../schema/batch-job";
import type { CanonicalJob } from "../schema/canonical-job";
import { resolveBatchItemAssets } from "./resolve-batch-item-assets.js";
import { resolveBatchItemDescription } from "./resolve-batch-item-description.js";

function buildPlatformTextBlock(item: BatchJob["items"][number]) {
	return {
		title: item.name,
		description: resolveBatchItemDescription(item),
	};
}

function buildBilibiliBlock(item: BatchJob["items"][number]) {
	return {
		...buildPlatformTextBlock(item),
		...(item.tags === undefined ? {} : { tags: item.tags }),
		...(item.sourceType === undefined ? {} : { sourceType: item.sourceType }),
		...(item.partition === undefined ? {} : { partition: item.partition }),
		...(item.creativeStatement === undefined ? {} : { creativeStatement: item.creativeStatement }),
		...(item.creativeStatementAuth === undefined
			? {}
			: { creativeStatementAuth: item.creativeStatementAuth }),
	};
}

function buildChannelsBlock(item: BatchJob["items"][number]) {
	return {
		...buildPlatformTextBlock(item),
		sourceType: item.sourceType ?? BilibiliSourceType.Original,
	};
}

export function projectBatchItemToCanonicalJob(
	batch: BatchJob,
	itemIndex: number,
	platform: PlatformId,
): CanonicalJob {
	const item = batch.items[itemIndex];
	if (!item) {
		throw new Error("batch_item_index_out_of_range");
	}
	if (!item.targets.includes(platform)) {
		throw new Error("batch_item_missing_platform_target");
	}

	const assets = resolveBatchItemAssets(batch, item);
	const textBlock = buildPlatformTextBlock(item);

	return {
		jobVersion: 2,
		platform,
		targets: [platform],
		publish: batch.publish,
		...(batch.policy === undefined ? {} : { policy: batch.policy }),
		assets,
		...(item.pageFields === undefined ? {} : { pageFields: item.pageFields }),
		...(platform === Platform.Bilibili ? { bilibili: buildBilibiliBlock(item) } : {}),
		...(platform === Platform.Douyin ? { douyin: textBlock } : {}),
		...(platform === Platform.Channels ? { channels: buildChannelsBlock(item) } : {}),
	};
}
