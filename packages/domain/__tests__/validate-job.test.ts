import { PublishMode, SubmitPolicy, validateJob } from "@auto-upload/domain";

describe("validateJob", () => {
	it("accepts a minimal semi manual bilibili job v1", () => {
		const result = validateJob({
			jobVersion: 1,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			bilibili: {
				title: "Hello",
				description: "World",
				tags: ["demo"],
			},
			assets: {
				localVideoPath: "/tmp/video.mp4",
			},
		});
		expect(result.ok).toBe(true);
	});

	it("accepts job v2 with pageFields only", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
			pageFields: [{ locator: { css: "#title" }, value: "Hello" }],
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(true);
	});

	it("rejects semi mode with programmatic submit", () => {
		const result = validateJob({
			jobVersion: 1,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Programmatic },
			bilibili: { title: "Hello", description: "World" },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});
		expect(result.ok).toBe(false);
	});
});
