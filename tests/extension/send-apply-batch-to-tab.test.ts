import { ApplyPhase } from "@yanxu/domain";
import type { HostOutboundMessage } from "@yanxu/domain";
import { ContentMessageType } from "../../extension/src/content/content-message-type";
import { TAB_MESSAGE_SAFE_BYTES } from "../../extension/src/shared/constants/tab-message-limits";
import * as estimateModule from "../../extension/src/shared/estimate-json-utf8-byte-length";
import { sendApplyBatchToTab } from "../../extension/src/sw/send-apply-batch-to-tab";

describe("sendApplyBatchToTab", () => {
	const sendMessageMock = jest.fn();

	beforeEach(() => {
		sendMessageMock.mockReset();
		jest.restoreAllMocks();
		(globalThis as { chrome?: unknown }).chrome = {
			tabs: { sendMessage: sendMessageMock },
		};
	});

	it("sends one ApplyJob message when the merged payload fits the tab limit", async () => {
		sendMessageMock.mockResolvedValue({ ok: true });

		const batch: HostOutboundMessage[] = [
			{
				type: "applyJobReady",
				payload: {
					applyPhase: ApplyPhase.FieldsOnly,
					jobJson: "{}",
					batch: { itemIndex: 0, targetPlatform: "bilibili" },
					attachments: {
						video: { kind: "skipped", reasonCode: "fields_only" },
						cover: { kind: "skipped", reasonCode: "no_cover" },
					},
				},
			},
		];

		await sendApplyBatchToTab(7, batch);

		expect(sendMessageMock).toHaveBeenCalledTimes(1);
		expect(sendMessageMock.mock.calls[0]?.[1]).toMatchObject({
			type: ContentMessageType.ApplyJob,
		});
	});

	it("streams host batch parts when merged payload would exceed the tab limit", async () => {
		sendMessageMock.mockResolvedValue({ ok: true });
		jest.spyOn(estimateModule, "estimateJsonUtf8ByteLength").mockImplementation((value) => {
			const candidate = value as { type?: unknown; payload?: unknown };
			if (candidate.type === ContentMessageType.ApplyJob) {
				return TAB_MESSAGE_SAFE_BYTES + 1;
			}
			return 128;
		});

		const batch: HostOutboundMessage[] = [
			{
				type: "videoStreamStart",
				mimeType: "video/mp4",
				suggestedFileName: "clip.mp4",
				totalBytes: 8,
				chunkCount: 1,
			},
			{ type: "videoStreamChunk", index: 0, base64: "AAAA" },
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

		await sendApplyBatchToTab(9, batch);

		expect(sendMessageMock.mock.calls[0]?.[1]).toEqual({
			type: ContentMessageType.ApplyJobStreamBegin,
		});
		expect(sendMessageMock.mock.calls[1]?.[1]).toEqual({
			type: ContentMessageType.ApplyJobPart,
			part: batch[0],
		});
		expect(sendMessageMock.mock.calls[2]?.[1]).toEqual({
			type: ContentMessageType.ApplyJobPart,
			part: batch[1],
		});
		expect(sendMessageMock.mock.calls[3]?.[1]).toEqual({
			type: ContentMessageType.ApplyJobPart,
			part: batch[2],
		});
		expect(sendMessageMock.mock.calls[4]?.[1]).toEqual({
			type: ContentMessageType.ApplyJobCommit,
		});
	});

	it("streams whenever native host sent video or cover chunks", async () => {
		sendMessageMock.mockResolvedValue({ ok: true });
		const estimateSpy = jest.spyOn(estimateModule, "estimateJsonUtf8ByteLength");

		const batch: HostOutboundMessage[] = [
			{
				type: "videoStreamStart",
				mimeType: "video/mp4",
				suggestedFileName: "clip.mp4",
				totalBytes: 4,
				chunkCount: 1,
			},
			{ type: "videoStreamChunk", index: 0, base64: "AAAA" },
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

		await sendApplyBatchToTab(3, batch);

		expect(estimateSpy).not.toHaveBeenCalled();
		expect(sendMessageMock).toHaveBeenCalledTimes(5);
	});
});
