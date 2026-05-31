import type { HostOutboundMessage } from "@auto-upload/domain";
import { mergeStreamsIntoApplyPayload } from "../shared/merge-streams-into-payload.js";
import { applyJobPayload } from "./apply-job.js";

const pendingHostBatch: HostOutboundMessage[] = [];

export function resetApplyJobHostBatch(): void {
	pendingHostBatch.length = 0;
}

export function pushApplyJobHostBatchPart(part: HostOutboundMessage): void {
	pendingHostBatch.push(part);
}

export async function commitApplyJobHostBatch(): Promise<void> {
	const terminal = pendingHostBatch[pendingHostBatch.length - 1];
	if (!terminal || terminal.type !== "applyJobReady") {
		resetApplyJobHostBatch();
		throw new Error("apply_job_batch_missing_ready");
	}

	const payload = mergeStreamsIntoApplyPayload(pendingHostBatch, terminal.payload);
	resetApplyJobHostBatch();
	await applyJobPayload(payload);
}
