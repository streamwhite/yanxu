import {
	BatchAssetKind,
	listRequiredBatchAssets,
	PublishMode,
	SubmitPolicy,
	validateJobFile,
} from "@auto-upload/domain";

describe("listRequiredBatchAssets", () => {
	const twoItemBatch = {
		jobVersion: 3 as const,
		assetsParentFolder: "/home/z/Downloads/media",
		publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
		items: [
			{ targets: ["bilibili", "douyin"] as const, name: "clip-a" },
			{ targets: ["douyin", "channels"] as const, name: "clip-b" },
		],
	};

	it("requires only videos by default because covers are optional", () => {
		const parsed = validateJobFile(twoItemBatch);
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		expect(listRequiredBatchAssets(parsed.job)).toEqual([
			{
				itemIndex: 0,
				kind: BatchAssetKind.Video,
				absolutePath: "/home/z/Downloads/media/clip-a.mp4",
			},
			{
				itemIndex: 1,
				kind: BatchAssetKind.Video,
				absolutePath: "/home/z/Downloads/media/clip-b.mp4",
			},
		]);
	});

	it("requires a cover only when includeCover is explicitly true", () => {
		const parsed = validateJobFile({
			...twoItemBatch,
			items: [{ targets: ["bilibili"], name: "clip-a", includeCover: true }],
		});
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		expect(listRequiredBatchAssets(parsed.job)).toEqual([
			{
				itemIndex: 0,
				kind: BatchAssetKind.Video,
				absolutePath: "/home/z/Downloads/media/clip-a.mp4",
			},
			{
				itemIndex: 0,
				kind: BatchAssetKind.Cover,
				absolutePath: "/home/z/Downloads/media/clip-a.png",
			},
		]);
	});

	it("skips cover file when includeCover is false", () => {
		const parsed = validateJobFile({
			...twoItemBatch,
			items: [{ targets: ["douyin"], name: "clip-b", includeCover: false }],
		});
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		expect(listRequiredBatchAssets(parsed.job)).toEqual([
			{
				itemIndex: 0,
				kind: BatchAssetKind.Video,
				absolutePath: "/home/z/Downloads/media/clip-b.mp4",
			},
		]);
	});
});
