import {
	type ApplyPhase,
	type AttachmentCoverPayload,
	type AttachmentVideoPayload,
	type HostOutboundBatch,
	type HostOutboundMessage,
	type PlatformId,
	NATIVE_MESSAGE_MAX_BYTES,
} from "@yanxu/domain";
import type { BatchApplyContext } from "@yanxu/domain";
import { estimateJsonByteLength } from "../outbound/estimate-json-byte-length.js";

const REASON_RESPONSE_TOO_LARGE = "native_message_response_too_large" as const;
const REASON_STREAM_ASSEMBLED_IN_EXTENSION = "stream_assembled_in_extension" as const;

export function buildApplyJobReady(
	applyPhase: ApplyPhase,
	jobJson: string,
	batch: BatchApplyContext,
	video: AttachmentVideoPayload,
	cover: AttachmentCoverPayload,
	coverHorizontal?: AttachmentCoverPayload,
): HostOutboundMessage {
	return {
		type: "applyJobReady",
		payload: {
			applyPhase,
			jobJson,
			batch,
			attachments: coverHorizontal ? { video, cover, coverHorizontal } : { video, cover },
		},
	};
}

function prependStreamBatches(
	batch: HostOutboundBatch,
	videoStream?: HostOutboundBatch,
	coverStream?: HostOutboundBatch,
	horizontalCoverStream?: HostOutboundBatch,
): HostOutboundBatch {
	if (videoStream?.length) batch.push(...videoStream);
	if (coverStream?.length) batch.push(...coverStream);
	if (horizontalCoverStream?.length) batch.push(...horizontalCoverStream);
	return batch;
}


export function buildOutboundApplyBatch(input: {
	applyPhase: ApplyPhase;
	jobJson: string;
	batchItemIndex: number;
	targetPlatform: PlatformId;
	video: AttachmentVideoPayload;
	cover: AttachmentCoverPayload;
	coverHorizontal?: AttachmentCoverPayload;
	videoStreamBatch?: HostOutboundBatch;
	coverStreamBatch?: HostOutboundBatch;
	coverHorizontalStreamBatch?: HostOutboundBatch;
}): HostOutboundBatch {
	const batch: BatchApplyContext = {
		itemIndex: input.batchItemIndex,
		targetPlatform: input.targetPlatform,
	};

	const videoForReady = input.videoStreamBatch?.length
		? { kind: "skipped" as const, reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION }
		: input.video;

	const coverForReady = input.coverStreamBatch?.length
		? { kind: "skipped" as const, reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION }
		: input.cover;

	const coverHorizontalForReady = input.coverHorizontalStreamBatch?.length
		? ({ kind: "skipped" as const, reasonCode: REASON_STREAM_ASSEMBLED_IN_EXTENSION } as const)
		: input.coverHorizontal;

	const ready = buildApplyJobReady(
		input.applyPhase,
		input.jobJson,
		batch,
		videoForReady,
		coverForReady,
		coverHorizontalForReady,
	);

	const byteLength = estimateJsonByteLength(ready);
	if (byteLength > NATIVE_MESSAGE_MAX_BYTES) {
		return [
			{
				type: "error",
				code: REASON_RESPONSE_TOO_LARGE,
				message: `Native messaging response is ${String(byteLength)} bytes (max ${String(NATIVE_MESSAGE_MAX_BYTES)}). Shorten job JSON or reduce inline attachments.`,
			},
		];
	}

	const outbound: HostOutboundBatch = [];
	prependStreamBatches(
		outbound,
		input.videoStreamBatch,
		input.coverStreamBatch,
		input.coverHorizontalStreamBatch,
	);
	outbound.push(ready);
	return outbound;
}

