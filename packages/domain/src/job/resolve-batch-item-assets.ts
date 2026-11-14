import { resolveAssetPathFromParentFolder } from "../assets/resolve-asset-path-from-parent-folder.js";
import type { BatchJob, BatchJobItem } from "../schema/batch-job";
import {
	deriveBatchItemCoverFileName,
	deriveBatchItemVideoFileName,
} from "./derive-batch-item-file-names.js";

export type ResolvedBatchItemAssets = {
	localVideoPath: string;
	localCoverPath?: string;
};

export function resolveBatchItemAssets(
	batch: BatchJob,
	item: BatchJobItem,
): ResolvedBatchItemAssets {
	const videoFileName = deriveBatchItemVideoFileName(item.name);
	const localVideoPath = resolveAssetPathFromParentFolder(batch.assetsParentFolder, videoFileName);

	const localCoverPath = item.includeCover !== false
		? resolveAssetPathFromParentFolder(
				batch.assetsParentFolder,
				deriveBatchItemCoverFileName(item.name),
			)
		: undefined;

	return {
		localVideoPath,
		...(localCoverPath === undefined ? {} : { localCoverPath }),
	};
}
