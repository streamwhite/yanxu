import { BatchAssetKind } from "../constants/batch-asset-kind.js";
import type { BatchJob } from "../schema/batch-job.js";
import { resolveBatchItemAssets } from "./resolve-batch-item-assets.js";

export type RequiredBatchAsset = {
	itemIndex: number;
	kind: BatchAssetKind;
	absolutePath: string;
};

export function listRequiredBatchAssets(batch: BatchJob): RequiredBatchAsset[] {
	const assets: RequiredBatchAsset[] = [];

	batch.items.forEach((item, itemIndex) => {
		const resolved = resolveBatchItemAssets(batch, item);
		assets.push({
			itemIndex,
			kind: BatchAssetKind.Video,
			absolutePath: resolved.localVideoPath,
		});

		if (resolved.localCoverPath !== undefined) {
			assets.push({
				itemIndex,
				kind: BatchAssetKind.Cover,
				absolutePath: resolved.localCoverPath,
			});
		}
	});

	return assets;
}
