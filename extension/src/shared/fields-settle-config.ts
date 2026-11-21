export const DEFAULT_FIELDS_SETTLE_MS = 1_000 as const;
export const MIN_FIELDS_SETTLE_MS = 0 as const;
export const MAX_FIELDS_SETTLE_MS = 120_000 as const;

export function clampFieldsSettleMs(value: number): number {
	if (!Number.isFinite(value)) return DEFAULT_FIELDS_SETTLE_MS;
	return Math.min(MAX_FIELDS_SETTLE_MS, Math.max(MIN_FIELDS_SETTLE_MS, Math.round(value)));
}
