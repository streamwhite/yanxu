import { BilibiliSourceType, PublishMode, SubmitPolicy, validateJob } from "@yanxu/domain";

describe("validateJob multi-platform v2", () => {
	it("accepts douyin with title and description", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "douyin",
			targets: ["douyin"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			douyin: { title: "Douyin title", description: "Douyin desc" },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(true);
	});

	it("accepts channels with title only", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			channels: { title: "Channels title" },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(true);
	});

	it("accepts channels with sourceType original", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			channels: { title: "Channels title", sourceType: BilibiliSourceType.Original },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(true);
	});

	it("rejects v2 when targets[0] does not match platform", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "douyin",
			targets: ["bilibili"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			douyin: { title: "x" },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(false);
	});
});
