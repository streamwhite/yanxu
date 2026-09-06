import type { AppliedJobPayload, HostOutboundMessage } from "@auto-upload/domain";

function findHorizontalCoverStreamStart(batch: HostOutboundMessage[]) {
	return batch.find((message) => message.type === "horizontalCoverStreamStart");
}

function collectHorizontalCoverStreamChunks(batch: HostOutboundMessage[]): string[] {
	return batch
		.filter((message) => message.type === "horizontalCoverStreamChunk")
		.sort((left, right) => left.index - right.index)
		.map((message) => message.base64);
}

export function mergeHorizontalCoverStreamIntoApplyPayload(
	batch: HostOutboundMessage[],
	payload: AppliedJobPayload,
): AppliedJobPayload {
	const streamStart = findHorizontalCoverStreamStart(batch);
	if (!streamStart) return payload;

	const base64Chunks = collectHorizontalCoverStreamChunks(batch);
	if (base64Chunks.length !== streamStart.chunkCount) {
		throw new Error(
			`horizontal_cover_stream_incomplete:${String(base64Chunks.length)}/${String(streamStart.chunkCount)}`,
		);
	}

	return {
		...payload,
		attachments: {
			...payload.attachments,
			coverHorizontal: {
				kind: "inlineBase64Chunks",
				mimeType: streamStart.mimeType,
				chunks: base64Chunks,
			},
		},
	};
}
