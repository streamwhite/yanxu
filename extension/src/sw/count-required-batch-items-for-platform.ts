import type { PlatformId } from "@auto-upload/domain";

export type JobOutlineForTabCount = {
	items: { targets: readonly string[]; itemIndex: number }[];
};

export function countRequiredBatchItemsForPlatform(
	outline: JobOutlineForTabCount,
	platform: PlatformId,
): number {
	return outline.items.filter((item) => item.targets.includes(platform)).length;
}
