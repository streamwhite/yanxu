import { ApplyPhase } from "@auto-upload/domain";
import type { AppliedJobPayload, HostOutboundMessage } from "@auto-upload/domain";
import { mergeCoverStreamIntoApplyPayload } from "../../extension/src/shared/merge-cover-stream-into-payload";

const BASE_PAYLOAD: AppliedJobPayload = {
	applyPhase: ApplyPhase.FieldsOnly,
	jobJson: "{}",
	batch: { itemIndex: 0, targetPlatform: "bilibili" },
	attachments: {
		video: { kind: "skipped", reasonCode: "fields_only_phase" },
		cover: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
	},
};

describe("mergeCoverStreamIntoApplyPayload", () => {
	it("merges cover stream chunks without joining base64 strings", () => {
		const batch: HostOutboundMessage[] = [
			{
				type: "coverStreamStart",
				mimeType: "image/png",
				suggestedFileName: "cover.png",
				totalBytes: 4,
				chunkCount: 2,
			},
			{ type: "coverStreamChunk", index: 0, base64: "AAAA" },
			{ type: "coverStreamChunk", index: 1, base64: "BBBB" },
		];

		const merged = mergeCoverStreamIntoApplyPayload(batch, BASE_PAYLOAD);
		expect(merged.attachments.cover).toEqual({
			kind: "inlineBase64Chunks",
			mimeType: "image/png",
			chunks: ["AAAA", "BBBB"],
		});
	});
});
