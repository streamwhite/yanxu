import type { AppliedJobPayload, HostOutboundMessage } from "@yanxu/domain";

function findCoverStreamStart(batch: HostOutboundMessage[]) {
	return batch.find((message) => message.type === "coverStreamStart");
}

function collectCoverStreamChunks(batch: HostOutboundMessage[]): string[] {
	return batch
		.filter((message) => message.type === "coverStreamChunk")
		.sort((left, right) => left.index - right.index)
		.map((message) => message.base64);
}

export function mergeCoverStreamIntoApplyPayload(
	batch: HostOutboundMessage[],
	payload: AppliedJobPayload,
): AppliedJobPayload {
	const streamStart = findCoverStreamStart(batch);
	if (!streamStart) return payload;

	const base64Chunks = collectCoverStreamChunks(batch);
	if (base64Chunks.length !== streamStart.chunkCount) {
		throw new Error(
			`cover_stream_incomplete:${String(base64Chunks.length)}/${String(streamStart.chunkCount)}`,
		);
	}

	return {
		...payload,
		attachments: {
			...payload.attachments,
			cover: {
				kind: "inlineBase64Chunks",
				mimeType: streamStart.mimeType,
				chunks: base64Chunks,
			},
		},
	};
}
