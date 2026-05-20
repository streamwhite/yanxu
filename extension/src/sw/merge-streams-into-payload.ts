import type { AppliedJobPayload, HostOutboundMessage } from "@auto-upload/domain";
import { mergeCoverStreamIntoApplyPayload } from "./merge-cover-stream-into-payload.js";
import { mergeVideoStreamIntoApplyPayload } from "./merge-video-stream-into-payload.js";

export function mergeStreamsIntoApplyPayload(
	batch: HostOutboundMessage[],
	payload: AppliedJobPayload,
): AppliedJobPayload {
	let merged = mergeVideoStreamIntoApplyPayload(batch, payload);
	merged = mergeCoverStreamIntoApplyPayload(batch, merged);
	return merged;
}
