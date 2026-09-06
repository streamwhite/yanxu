import { normalizeCanonicalJobTexts } from "@auto-upload/domain";

describe("normalizeCanonicalJobTexts channels title", () => {
	it("replaces dots in channels title before fill", () => {
		const job = normalizeCanonicalJobTexts({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "MiniMax豪募160.4亿港元" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(job.jobVersion).toBe(2);
		if (job.jobVersion !== 2) return;
		expect(job.channels?.title).toBe("MiniMax豪募160点4亿港元");
	});
});
