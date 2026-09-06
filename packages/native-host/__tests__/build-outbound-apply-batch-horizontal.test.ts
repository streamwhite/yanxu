import type { HostOutboundBatch } from "@auto-upload/domain";
import { buildOutboundApplyBatch } from "../src/router/build-outbound-apply-batch";

const BASE_INPUT = {
	applyPhase: "fields" as never,
	jobJson: "{}",
	batchItemIndex: 0,
	targetPlatform: "bilibili" as never,
	video: { kind: "skipped", reasonCode: "fields_only_phase" } as never,
	cover: { kind: "inlineBase64", mimeType: "image/png", base64: "aGk=" } as never,
};

describe("buildOutboundApplyBatch horizontal cover", () => {
	it("omits coverHorizontal when not provided", () => {
		const batch = buildOutboundApplyBatch(BASE_INPUT);
		const ready = batch[batch.length - 1];
		if (ready?.type !== "applyJobReady") throw new Error("expected applyJobReady");
		expect(ready.payload.attachments.coverHorizontal).toBeUndefined();
	});

	it("includes inline horizontal cover payload", () => {
		const batch = buildOutboundApplyBatch({
			...BASE_INPUT,
			coverHorizontal: { kind: "inlineBase64", mimeType: "image/jpeg", base64: "aGk=" },
		});
		const ready = batch[batch.length - 1];
		if (ready?.type !== "applyJobReady") throw new Error("expected applyJobReady");
		expect(ready.payload.attachments.coverHorizontal?.kind).toBe("inlineBase64");
	});

	it("replaces inline horizontal cover with skipped reason when streamed", () => {
		const streamBatch: HostOutboundBatch = [
			{
				type: "horizontalCoverStreamStart",
				mimeType: "image/png",
				suggestedFileName: "cover-4x3.png",
				totalBytes: 2,
				chunkCount: 1,
			},
			{ type: "horizontalCoverStreamChunk", index: 0, base64: "aGk=" },
		];
		const batch = buildOutboundApplyBatch({
			...BASE_INPUT,
			coverHorizontal: { kind: "inlineBase64", mimeType: "image/png", base64: "aGk=" },
			coverHorizontalStreamBatch: streamBatch,
		});

		expect(batch[0]?.type).toBe("horizontalCoverStreamStart");
		const ready = batch[batch.length - 1];
		if (ready?.type !== "applyJobReady") throw new Error("expected applyJobReady");
		expect(ready.payload.attachments.coverHorizontal).toEqual({
			kind: "skipped",
			reasonCode: "stream_assembled_in_extension",
		});
	});
});
