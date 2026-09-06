import type { JobFileOutlinePayload, PlatformId } from "@auto-upload/domain";

export type PlatformOutlineItem = {
	itemIndex: number;
	name: string;
};

export function listPlatformOutlineItems(
	outline: JobFileOutlinePayload,
	platform: PlatformId,
): PlatformOutlineItem[] {
	return outline.items
		.filter((item) => item.targets.includes(platform))
		.map((item) => ({
			itemIndex: item.itemIndex,
			name: item.name ?? `Item ${String(item.itemIndex + 1)}`,
		}));
}
