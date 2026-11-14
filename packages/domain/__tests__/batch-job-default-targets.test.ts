import {
	DEFAULT_BATCH_ITEM_TARGETS,
	PublishMode,
	SubmitPolicy,
	validateJobFile,
} from "@yanxu/domain";

describe("batch job default targets", () => {
	const baseBatch = {
		jobVersion: 3 as const,
		assetsParentFolder: "/tmp/uploads",
		publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
	};

	it("defaults targets to all platforms when omitted", () => {
		const result = validateJobFile({
			...baseBatch,
			items: [{ name: "clip-a" }],
		});
		expect(result.ok).toBe(true);
		if (!result.ok || result.kind !== "batch") return;
		expect(result.job.items[0]?.targets).toEqual([...DEFAULT_BATCH_ITEM_TARGETS]);
	});
});
