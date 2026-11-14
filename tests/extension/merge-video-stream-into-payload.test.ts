import { ApplyPhase } from "@yanxu/domain";
import type { AppliedJobPayload, HostOutboundMessage } from "@yanxu/domain";
import { mergeVideoStreamIntoApplyPayload } from "../../extension/src/shared/merge-video-stream-into-payload";

const BASE_PAYLOAD: AppliedJobPayload = {
	applyPhase: ApplyPhase.VideoOnly,
	jobJson: "{}",
	batch: { itemIndex: 0, targetPlatform: "bilibili" },
	attachments: {
		video: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
		cover: { kind: "skipped", reasonCode: "video_only_phase" },
	},
};

describe("mergeVideoStreamIntoApplyPayload", () => {
	it("returns payload unchanged when no stream messages", () => {
		const batch: HostOutboundMessage[] = [{ type: "applyJobReady", payload: BASE_PAYLOAD }];
		expect(mergeVideoStreamIntoApplyPayload(batch, BASE_PAYLOAD)).toEqual(BASE_PAYLOAD);
	});

	it("merges stream chunks into inline video attachment", () => {
		const batch: HostOutboundMessage[] = [
			{
				type: "videoStreamStart",
				mimeType: "video/mp4",
				suggestedFileName: "clip.mp4",
				totalBytes: 4,
				chunkCount: 2,
			},
			{ type: "videoStreamChunk", index: 0, base64: "AAAA" },
			{ type: "videoStreamChunk", index: 1, base64: "BBBB" },
		];

		const merged = mergeVideoStreamIntoApplyPayload(batch, BASE_PAYLOAD);
		expect(merged.attachments.video).toEqual({
			kind: "inlineBase64Chunks",
			mimeType: "video/mp4",
			chunks: ["AAAA", "BBBB"],
			suggestedFileName: "clip.mp4",
		});
	});

	it("throws when chunk count mismatches stream start", () => {
		const batch: HostOutboundMessage[] = [
			{
				type: "videoStreamStart",
				mimeType: "video/mp4",
				suggestedFileName: "clip.mp4",
				totalBytes: 4,
				chunkCount: 2,
			},
			{ type: "videoStreamChunk", index: 0, base64: "AAAA" },
		];

		expect(() => mergeVideoStreamIntoApplyPayload(batch, BASE_PAYLOAD)).toThrow(
			/video_stream_incomplete/,
		);
	});
});
