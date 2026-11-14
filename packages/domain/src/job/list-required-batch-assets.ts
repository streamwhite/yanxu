import { BatchAssetKind } from "../constants/batch-asset-kind.js";
import type { BatchJob } from "../schema/batch-job.js";
import { listHorizontalCoverPathCandidates } from "../assets/list-batch-cover-path-candidates.js";
import { batchItemRequiresCoverAsset } from "./batch-item-requires-cover-asset.js";
import { resolveBatchItemAssets } from "./resolve-batch-item-assets.js";

export type RequiredBatchAsset = {
	itemIndex: number;
	kind: BatchAssetKind;
	absolutePath: string;
};

export type ListRequiredBatchAssetsOptions = {
	includeHorizontalCover?: boolean;
};

function firstHorizontalCoverPathHint(coverPath: string): string {
	return listHorizontalCoverPathCandidates(coverPath)[0] ?? coverPath;
}

export function listRequiredBatchAssets(
	batch: BatchJob,
	options: ListRequiredBatchAssetsOptions = {},
): RequiredBatchAsset[] {
	const assets: RequiredBatchAsset[] = [];

	batch.items.forEach((item, itemIndex) => {
		const resolved = resolveBatchItemAssets(batch, item);
		assets.push({
			itemIndex,
			kind: BatchAssetKind.Video,
			absolutePath: resolved.localVideoPath,
		});

		if (batchItemRequiresCoverAsset(item) && resolved.localCoverPath !== undefined) {
			assets.push({
				itemIndex,
				kind: BatchAssetKind.Cover,
				absolutePath: resolved.localCoverPath,
			});

			if (options.includeHorizontalCover === true) {
				assets.push({
					itemIndex,
					kind: BatchAssetKind.HorizontalCover,
					absolutePath: firstHorizontalCoverPathHint(resolved.localCoverPath),
				});
			}
		}
	});

	return assets;
}
