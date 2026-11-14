import {
	PublishMode,
	projectBatchItemToCanonicalJob,
	SubmitPolicy,
	validateJobFile,
} from "@yanxu/domain";

describe("projectBatchItemToCanonicalJob", () => {
	const batch = {
		jobVersion: 3 as const,
		assetsParentFolder: "/tmp/media",
		publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
		items: [
			{ targets: ["bilibili", "douyin"] as const, name: "clip-a" },
			{ targets: ["douyin", "channels"] as const, name: "clip-b" },
		],
	};

	it("projects item 1 for channels with clip-b video path", () => {
		const parsed = validateJobFile(batch);
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		const channelsJob = projectBatchItemToCanonicalJob(parsed.job, 1, "channels");
		expect(channelsJob.platform).toBe("channels");
		expect(channelsJob.assets.localVideoPath).toBe("/tmp/media/clip-b.mp4");
		if (channelsJob.platform !== "channels" || !channelsJob.channels) {
			throw new Error("expected channels job");
		}
		expect(channelsJob.channels.title).toBe("clip-b");
	});

	it("passes sourceType to channels when set on batch item", () => {
		const batch = {
			jobVersion: 3 as const,
			assetsParentFolder: "/tmp/media",
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{
					targets: ["channels"] as const,
					name: "clip-b",
					sourceType: "original" as const,
				},
			],
		};

		const parsed = validateJobFile(batch);
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		const channelsJob = projectBatchItemToCanonicalJob(parsed.job, 0, "channels");
		expect(channelsJob.platform).toBe("channels");
		if (channelsJob.platform !== "channels" || !channelsJob.channels) {
			throw new Error("expected channels job");
		}
		expect(channelsJob.channels.sourceType).toBe("original");
	});

	it("projects item 0 for bilibili with clip-a video path", () => {
		const parsed = validateJobFile(batch);
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		const bilibili = projectBatchItemToCanonicalJob(parsed.job, 0, "bilibili");
		expect(bilibili.assets.localVideoPath).toBe("/tmp/media/clip-a.mp4");
	});

	it("keeps an explicitly empty description blank", () => {
		const batchWithEmptyDesc = {
			jobVersion: 3 as const,
			assetsParentFolder: "/tmp/media",
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			items: [
				{
					targets: ["douyin"] as const,
					name: "被忽视的趋势改变着AI市场",
					description: "",
				},
			],
		};

		const parsed = validateJobFile(batchWithEmptyDesc);
		if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");

		const douyin = projectBatchItemToCanonicalJob(parsed.job, 0, "douyin");
		if (douyin.platform !== "douyin" || !douyin.douyin) {
			throw new Error("expected douyin job");
		}
		expect(douyin.douyin.description).toBe("");
	});
});
