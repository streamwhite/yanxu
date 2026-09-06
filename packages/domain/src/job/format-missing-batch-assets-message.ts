import { listBatchCoverPathCandidates } from "../assets/list-batch-cover-path-candidates.js";
import { BatchAssetKind } from "../constants/batch-asset-kind.js";

export type MissingBatchAsset = {
	itemIndex: number;
	kind: BatchAssetKind;
	absolutePath: string;
};

const BATCH_ASSET_KIND_LABELS: Record<BatchAssetKind, string> = {
	video: "video file",
	cover: "cover file",
	horizontalCover: "horizontal (4:3) cover file",
};

function formatMissingCoverPath(absolutePath: string): string {
	const candidates = listBatchCoverPathCandidates(absolutePath);
	if (candidates.length <= 1) return absolutePath;
	return `${absolutePath} (also accepts ${candidates.slice(1).join(", ")})`;
}

function formatMissingEntry(entry: MissingBatchAsset): string {
	const label = BATCH_ASSET_KIND_LABELS[entry.kind];
	const path =
		entry.kind === BatchAssetKind.Cover || entry.kind === BatchAssetKind.HorizontalCover
			? formatMissingCoverPath(entry.absolutePath)
			: entry.absolutePath;
	return `item ${String(entry.itemIndex)}: missing ${label} ${path}`;
}


export function formatMissingBatchAssetsMessage(missing: MissingBatchAsset[]): string {
	return missing.map(formatMissingEntry).join("; ");
}
