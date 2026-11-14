import { ApplyPhase } from "@yanxu/domain";
import type { HostOutboundMessage } from "@yanxu/domain";
import {
	commitApplyJobHostBatch,
	pushApplyJobHostBatchPart,
	resetApplyJobHostBatch,
} from "../../extension/src/content/apply-job-host-batch";
import * as applyJobModule from "../../extension/src/content/apply-job";

describe("applyJobHostBatch", () => {
	beforeEach(() => {
		resetApplyJobHostBatch();
		jest.restoreAllMocks();
	});

	it("merges streamed host parts then applies once", async () => {
		const applySpy = jest.spyOn(applyJobModule, "applyJobPayload").mockResolvedValue();

		const batch: HostOutboundMessage[] = [
			{
				type: "videoStreamStart",
				mimeType: "video/mp4",
				suggestedFileName: "clip.mp4",
				totalBytes: 2,
				chunkCount: 1,
			},
			{ type: "videoStreamChunk", index: 0, base64: "AQID" },
			{
				type: "applyJobReady",
				payload: {
					applyPhase: ApplyPhase.VideoOnly,
					jobJson: "{}",
					batch: { itemIndex: 0, targetPlatform: "douyin" },
					attachments: {
						video: { kind: "skipped", reasonCode: "stream_assembled_in_extension" },
						cover: { kind: "skipped", reasonCode: "video_only" },
					},
				},
			},
		];

		for (const part of batch) {
			pushApplyJobHostBatchPart(part);
		}

		await commitApplyJobHostBatch();

		expect(applySpy).toHaveBeenCalledTimes(1);
		expect(applySpy.mock.calls[0]?.[0]?.attachments.video).toEqual({
			kind: "inlineBase64Chunks",
			mimeType: "video/mp4",
			chunks: ["AQID"],
			suggestedFileName: "clip.mp4",
		});
	});
});
