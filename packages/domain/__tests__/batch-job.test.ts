import {
	PublishMode,
	SubmitPolicy,
	buildJobFileOutline,
	deriveBatchItemCoverFileName,
	deriveBatchItemVideoFileName,
	listBatchItemIndicesForPlatform,
	listRequiredBatchAssets,
	projectBatchItemToCanonicalJob,
	resolveBatchItemAssets,
	validateJobFile,
	BatchAssetKind,
} from "@auto-upload/domain";

describe("batch job v3", () => {
	const baseBatch = {
		jobVersion: 3 as const,
		assetsParentFolder: "/tmp/uploads",
		publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
		items: [
			{
				targets: ["bilibili", "douyin"] as const,
				name: "clip-a",
				description: "Shared description A",
				tags: ["demo"],
			},
			{
				targets: ["douyin"] as const,
				name: "clip-b",
				includeCover: false,
			},
		],
	};

	it("accepts batch job with single name per item", () => {
		const result = validateJobFile(baseBatch);
		expect(result.ok).toBe(true);
		if (!result.ok || result.kind !== "batch") return;
		expect(result.job.items).toHaveLength(2);
	});

	it("derives video and cover file names from name", () => {
		expect(deriveBatchItemVideoFileName("clip-a")).toBe("clip-a.mp4");
		expect(deriveBatchItemCoverFileName("clip-a")).toBe("clip-a.png");
	});

	it("resolves assets from parent folder and derived file names", () => {
		const result = validateJobFile(baseBatch);
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		const assets = resolveBatchItemAssets(result.job, result.job.items[0]);
		expect(assets.localVideoPath).toBe("/tmp/uploads/clip-a.mp4");
		expect(assets.localCoverPath).toBe("/tmp/uploads/clip-a.png");
	});

	it("lists cover paths as required only when explicitly enabled", () => {
		const result = validateJobFile({
			...baseBatch,
			items: [{ ...baseBatch.items[0], includeCover: true }, baseBatch.items[1]],
		});
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		const required = listRequiredBatchAssets(result.job);
		expect(required).toEqual([
			{
				itemIndex: 0,
				kind: BatchAssetKind.Video,
				absolutePath: "/tmp/uploads/clip-a.mp4",
			},
			{
				itemIndex: 0,
				kind: BatchAssetKind.Cover,
				absolutePath: "/tmp/uploads/clip-a.png",
			},
			{
				itemIndex: 1,
				kind: BatchAssetKind.Video,
				absolutePath: "/tmp/uploads/clip-b.mp4",
			},
		]);
	});

	it("omits cover when includeCover is false", () => {
		const result = validateJobFile(baseBatch);
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		const assets = resolveBatchItemAssets(result.job, result.job.items[1]);
		expect(assets.localVideoPath).toBe("/tmp/uploads/clip-b.mp4");
		expect(assets.localCoverPath).toBeUndefined();
	});

	it("uses name as title on every platform block", () => {
		const result = validateJobFile(baseBatch);
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		const bilibili = projectBatchItemToCanonicalJob(result.job, 0, "bilibili");
		expect(bilibili.bilibili?.title).toBe("clip-a");

		const douyin = projectBatchItemToCanonicalJob(result.job, 0, "douyin");
		if (douyin.jobVersion !== 2) throw new Error("expected v2");
		expect(douyin.douyin?.title).toBe("clip-a");
	});

	it("lists item indices per platform", () => {
		const result = validateJobFile(baseBatch);
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		expect(listBatchItemIndicesForPlatform(result.job, "douyin")).toEqual([0, 1]);
		expect(listBatchItemIndicesForPlatform(result.job, "bilibili")).toEqual([0]);
	});

	it("builds outline for tab matching", () => {
		const result = validateJobFile(baseBatch);
		if (!result.ok || result.kind !== "batch") throw new Error("expected batch");

		const outline = buildJobFileOutline(result.job);
		expect(outline.jobVersion).toBe(3);
		expect(outline.items).toHaveLength(2);
		expect(outline.items[0]?.name).toBe("clip-a");
		expect(outline.items[1]?.name).toBe("clip-b");
	});

	it("rejects names with path separators", () => {
		const result = validateJobFile({
			...baseBatch,
			items: [{ targets: ["douyin"], name: "sub/clip" }],
		});
		expect(result.ok).toBe(false);
	});
});
