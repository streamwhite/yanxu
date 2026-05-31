export const BATCH_PROGRESS_STORAGE_KEY = "batchProgressLog" as const;

export const BatchProgressKind = {
	Video: "video",
	Field: "field",
	Cover: "cover",
	Slot: "slot",
	Warning: "warning",
} as const;

export type BatchProgressKind = (typeof BatchProgressKind)[keyof typeof BatchProgressKind];

export type BatchProgressEntry = {
	at: number;
	requestId: string;
	platform: string;
	itemIndex: number;
	kind: BatchProgressKind;
	label: string;
};

export type StoredBatchProgress = {
	requestId: string;
	entries: BatchProgressEntry[];
};

export function formatBatchProgressLine(entry: BatchProgressEntry): string {
	const item = `item ${String(entry.itemIndex)}`;
	return `${entry.platform} ${item}: ${entry.label}`;
}
