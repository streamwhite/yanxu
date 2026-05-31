import { assertBatchJobOutline } from "../../extension/src/sw/assert-batch-job-outline";

describe("assertBatchJobOutline", () => {
	it("accepts jobVersion 3", () => {
		expect(
			assertBatchJobOutline({
				ok: true,
				outline: { jobVersion: 3, items: [{ itemIndex: 0, targets: ["douyin"] }] },
			}),
		).toEqual({ ok: true });
	});

	it("rejects non-batch job versions", () => {
		const result = assertBatchJobOutline({
			ok: true,
			outline: { jobVersion: 2, items: [{ itemIndex: 0, targets: ["douyin"] }] },
		});
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.code).toBe("batch_job_required");
	});
});
