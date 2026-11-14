import type { AppliedJobPayload, HostOutboundMessage } from "@yanxu/domain";

function findStreamStart(batch: HostOutboundMessage[]) {
	return batch.find((message) => message.type === "videoStreamStart");
}

function collectStreamChunks(batch: HostOutboundMessage[]): string[] {
	return batch
		.filter((message) => message.type === "videoStreamChunk")
		.sort((left, right) => left.index - right.index)
		.map((message) => message.base64);
}

export function mergeVideoStreamIntoApplyPayload(
	batch: HostOutboundMessage[],
	payload: AppliedJobPayload,
): AppliedJobPayload {
	const streamStart = findStreamStart(batch);
	if (!streamStart) return payload;

	const chunks = collectStreamChunks(batch);
	if (chunks.length !== streamStart.chunkCount) {
		throw new Error(
			`video_stream_incomplete:${String(chunks.length)}/${String(streamStart.chunkCount)}`,
		);
	}

	return {
		...payload,
		attachments: {
			...payload.attachments,
			video: {
				kind: "inlineBase64Chunks",
				mimeType: streamStart.mimeType,
				chunks,
				suggestedFileName: streamStart.suggestedFileName,
			},
		},
	};
}
