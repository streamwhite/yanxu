import { BilibiliSourceType, validateJob } from "@yanxu/domain";

describe("bilibili sourceType", () => {
	it("accepts sourceType on job v2", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: "semi", submit: "manual" },
			bilibili: { title: "t", sourceType: BilibiliSourceType.Repost },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});

		expect(result.ok).toBe(true);
	});
});
