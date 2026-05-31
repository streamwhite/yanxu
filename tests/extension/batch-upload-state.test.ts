import {
	isFillEnabledForJobPath,
	type BatchUploadState,
} from "../../extension/src/shared/batch-upload-state";

describe("batch upload state", () => {
	it("enables fill only when job path matches uploaded state", () => {
		const state: BatchUploadState = {
			jobFilePath: "/tmp/batch.job.json",
			uploadedAt: Date.now(),
		};
		expect(isFillEnabledForJobPath(state, "/tmp/batch.job.json")).toBe(true);
		expect(isFillEnabledForJobPath(state, "/other/job.json")).toBe(false);
		expect(isFillEnabledForJobPath(null, "/tmp/batch.job.json")).toBe(false);
	});
});
