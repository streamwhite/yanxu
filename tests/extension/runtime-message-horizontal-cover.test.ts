import { RuntimeUploadAndFillAllTabsMessageSchema } from "../../extension/src/runtime/runtime-message";

describe("RuntimeUploadAndFillAllTabsMessageSchema submitHorizontalCover", () => {
	it("defaults to absent (unchecked)", () => {
		const parsed = RuntimeUploadAndFillAllTabsMessageSchema.safeParse({
			type: "runtime.uploadAndFillAllTabs",
			requestId: "req-1",
			jobFilePath: "/tmp/job.json",
		});
		expect(parsed.success).toBe(true);
		if (!parsed.success) return;
		expect(parsed.data.submitHorizontalCover).toBeUndefined();
	});

	it("accepts submitHorizontalCover true", () => {
		const parsed = RuntimeUploadAndFillAllTabsMessageSchema.safeParse({
			type: "runtime.uploadAndFillAllTabs",
			requestId: "req-1",
			jobFilePath: "/tmp/job.json",
			submitHorizontalCover: true,
		});
		expect(parsed.success).toBe(true);
		if (!parsed.success) return;
		expect(parsed.data.submitHorizontalCover).toBe(true);
	});

	it("rejects non-boolean submitHorizontalCover", () => {
		const parsed = RuntimeUploadAndFillAllTabsMessageSchema.safeParse({
			type: "runtime.uploadAndFillAllTabs",
			requestId: "req-1",
			jobFilePath: "/tmp/job.json",
			submitHorizontalCover: "yes",
		});
		expect(parsed.success).toBe(false);
	});
});
