import type { BatchAssetKind } from "../constants/batch-asset-kind.js";

export type MissingBatchAsset = {
	itemIndex: number;
	kind: BatchAssetKind;
	absolutePath: string;
};

const BATCH_ASSET_KIND_LABELS: Record<BatchAssetKind, string> = {
	video: "video file",
	cover: "cover file",
};

function formatMissingEntry(entry: MissingBatchAsset): string {
	const label = BATCH_ASSET_KIND_LABELS[entry.kind];
	return `item ${String(entry.itemIndex)}: missing ${label} ${entry.absolutePath}`;
}

export function formatMissingBatchAssetsMessage(missing: MissingBatchAsset[]): string {
	return missing.map(formatMissingEntry).join("; ");
}
