import { ApplyPhase, HostInboundMessageSchema } from "@yanxu/domain";

describe("HostInboundMessageSchema", () => {
	it("parses applyBatchItemFromFile with itemIndex 0", () => {
		const parsed = HostInboundMessageSchema.safeParse({
			type: "applyBatchItemFromFile",
			jobFilePath: "/tmp/batch.job.json",
			applyPhase: ApplyPhase.VideoOnly,
			itemIndex: 0,
			platform: "douyin",
		});

		expect(parsed.success).toBe(true);
		if (!parsed.success) return;
		expect(parsed.data).toEqual({
			type: "applyBatchItemFromFile",
			jobFilePath: "/tmp/batch.job.json",
			applyPhase: ApplyPhase.VideoOnly,
			itemIndex: 0,
			platform: "douyin",
		});
	});
});
