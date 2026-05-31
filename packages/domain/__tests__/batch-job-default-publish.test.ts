import {
	DEFAULT_BATCH_PUBLISH,
	PublishMode,
	SubmitPolicy,
	validateJobFile,
} from "@auto-upload/domain";

describe("batch job default publish", () => {
	it("defaults publish to semi manual when omitted", () => {
		const result = validateJobFile({
			jobVersion: 3,
			assetsParentFolder: "/tmp/uploads",
			items: [{ name: "clip-a" }],
		});
		expect(result.ok).toBe(true);
		if (!result.ok || result.kind !== "batch") return;
		expect(result.job.publish).toEqual(DEFAULT_BATCH_PUBLISH);
		expect(result.job.publish.mode).toBe(PublishMode.Semi);
		expect(result.job.publish.submit).toBe(SubmitPolicy.Manual);
	});
});
