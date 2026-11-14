import {
	BatchAssetKind,
	type BatchJob,
	listRequiredBatchAssets,
} from "@auto-upload/domain";

function buildBatch(): BatchJob {
	return {
		jobVersion: 3,
		assetsParentFolder: "/tmp/assets",
		items: [
			{
				targets: ["bilibili"],
				name: "item-a",
				includeCover: true,
			} as BatchJob["items"][number],
		],
	} as unknown as BatchJob;
}

describe("listRequiredBatchAssets with includeHorizontalCover", () => {
	it("does not require horizontal covers by default", () => {
		const assets = listRequiredBatchAssets(buildBatch());
		expect(assets.some((asset) => asset.kind === BatchAssetKind.HorizontalCover)).toBe(false);
	});

	it("requires a -4x3 horizontal cover per item when enabled", () => {
		const assets = listRequiredBatchAssets(buildBatch(), { includeHorizontalCover: true });
		const horizontal = assets.filter((asset) => asset.kind === BatchAssetKind.HorizontalCover);
		expect(horizontal).toHaveLength(1);
		expect(horizontal[0]?.absolutePath).toBe("/tmp/assets/item-a-4x3.png");
	});

	it("skips horizontal covers for items without cover", () => {
		const batch = buildBatch();
		batch.items[0] = { ...batch.items[0], includeCover: false } as BatchJob["items"][number];
		const assets = listRequiredBatchAssets(batch, { includeHorizontalCover: true });
		expect(assets.some((asset) => asset.kind === BatchAssetKind.HorizontalCover)).toBe(false);
	});
});
