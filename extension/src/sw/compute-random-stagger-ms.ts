import {
	BATCH_ITEM_STAGGER_MAX_MS,
	BATCH_ITEM_STAGGER_MIN_MS,
} from "./constants/batch-item-stagger-timing.js";

export function computeRandomStaggerMs(
	minMs: number = BATCH_ITEM_STAGGER_MIN_MS,
	maxMs: number = BATCH_ITEM_STAGGER_MAX_MS,
	random: () => number = Math.random,
): number {
	const low = Math.min(minMs, maxMs);
	const high = Math.max(minMs, maxMs);
	const span = high - low + 1;
	return low + Math.floor(random() * span);
}
