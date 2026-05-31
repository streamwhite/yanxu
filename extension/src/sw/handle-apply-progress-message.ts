import { ContentMessageType } from "../content/content-message-type.js";
import { appendBatchProgress } from "../shared/batch-progress-store.js";
import type { BatchProgressKind } from "../shared/batch-progress.js";
import { getActiveBatchRequestId } from "./active-batch-request.js";

function isApplyProgressMessage(value: unknown): value is {
	type: typeof ContentMessageType.ApplyProgress;
	platform: string;
	itemIndex: number;
	kind: BatchProgressKind;
	label: string;
} {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Record<string, unknown>;
	return (
		candidate.type === ContentMessageType.ApplyProgress &&
		typeof candidate.platform === "string" &&
		typeof candidate.itemIndex === "number" &&
		typeof candidate.kind === "string" &&
		typeof candidate.label === "string"
	);
}

export function handleApplyProgressMessage(message: unknown): boolean {
	if (!isApplyProgressMessage(message)) return false;

	const requestId = getActiveBatchRequestId();
	if (!requestId) return false;

	void appendBatchProgress({
		at: Date.now(),
		requestId,
		platform: message.platform,
		itemIndex: message.itemIndex,
		kind: message.kind,
		label: message.label,
	});

	return false;
}
