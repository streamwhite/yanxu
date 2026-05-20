import { NATIVE_MESSAGE_MAX_BYTES } from "@auto-upload/domain";

const STREAM_FRAME_BUDGET_BYTES = Math.floor(NATIVE_MESSAGE_MAX_BYTES * 0.75);

const MIN_STREAM_CHUNK_BYTES = 64 * 1024;

const BASE64_OVERHEAD_FACTOR = 1.4;

export function estimateStreamChunkBytes(transferChunkBytes: number): number {
	const rawBudget = Math.floor(STREAM_FRAME_BUDGET_BYTES / BASE64_OVERHEAD_FACTOR);
	return Math.min(transferChunkBytes, Math.max(rawBudget, MIN_STREAM_CHUNK_BYTES));
}
