import { mergeHorizontalCoverStreamIntoApplyPayload } from "../../extension/src/shared/merge-horizontal-cover-stream-into-payload";
import type { AppliedJobPayload, HostOutboundMessage } from "@auto-upload/domain";

function buildPayload(): AppliedJobPayload {
	return {
		applyPhase: "fields",
		jobJson: "{}",
		batch: { itemIndex: 0, targetPlatform: "douyin" },
		attachments: {
			video: { kind: "skipped", reasonCode: "fields_only_phase" },
			cover: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
		},
	} as unknown as AppliedJobPayload;
}

function buildStreamBatch(): HostOutboundMessage[] {
	return [
		{
			type: "horizontalCoverStreamStart",
			mimeType: "image/png",
			suggestedFileName: "cover-4x3.png",
			totalBytes: 4,
			chunkCount: 2,
		},
		{ type: "horizontalCoverStreamChunk", index: 1, base64: "aGk=" },
		{ type: "horizontalCoverStreamChunk", index: 0, base64: "aGV=" },
	];
}

describe("mergeHorizontalCoverStreamIntoApplyPayload", () => {
	it("returns payload unchanged without horizontal stream", () => {
		const payload = buildPayload();
		expect(mergeHorizontalCoverStreamIntoApplyPayload([], payload)).toBe(payload);
	});

	it("merges sorted chunks into coverHorizontal attachment", () => {
		const merged = mergeHorizontalCoverStreamIntoApplyPayload(buildStreamBatch(), buildPayload());
		expect(merged.attachments.coverHorizontal).toEqual({
			kind: "inlineBase64Chunks",
			mimeType: "image/png",
			chunks: ["aGV=", "aGk="],
		});
	});

	it("throws when chunks are incomplete", () => {
		const batch = buildStreamBatch().filter((message) => message.type !== "horizontalCoverStreamChunk");
		expect(() => mergeHorizontalCoverStreamIntoApplyPayload(batch, buildPayload())).toThrow(
			/horizontal_cover_stream_incomplete/,
		);
	});
});
