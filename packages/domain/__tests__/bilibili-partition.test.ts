import { validateJob } from "@yanxu/domain";

describe("bilibili partition", () => {
	it("accepts partition on job v2", () => {
		const result = validateJob({
			jobVersion: 2,
			platform: "bilibili",
			targets: ["bilibili"],
			publish: { mode: "semi", submit: "manual" },
			bilibili: { title: "t", partition: "vlog" },
			assets: { localVideoPath: "/tmp/video.mp4" },
		});

		expect(result.ok).toBe(true);
	});
});
