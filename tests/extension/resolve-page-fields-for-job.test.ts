import { resolvePageFieldsForJob } from "../../extension/src/platforms/resolve-page-fields-for-job";

describe("resolvePageFieldsForJob", () => {
	it("maps douyin title and description", () => {
		const fields = resolvePageFieldsForJob({
			jobVersion: 2,
			platform: "douyin",
			targets: ["douyin"],
			publish: { mode: "semi", submit: "manual" },
			douyin: { title: "T", description: "D" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields).toHaveLength(2);
		expect(fields[0]?.value).toBe("T");
		expect(fields[1]?.value).toBe("D");
	});

	it("maps channels title only", () => {
		const fields = resolvePageFieldsForJob({
			jobVersion: 2,
			platform: "channels",
			targets: ["channels"],
			publish: { mode: "semi", submit: "manual" },
			channels: { title: "CT" },
			assets: { localVideoPath: "/tmp/v.mp4" },
		});

		expect(fields).toHaveLength(1);
		expect(fields[0]?.value).toBe("CT");
	});
});
