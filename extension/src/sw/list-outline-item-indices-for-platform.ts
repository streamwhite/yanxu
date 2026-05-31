import type { PlatformId } from "@auto-upload/domain";
import type { JobOutlineForTabCount } from "./count-required-batch-items-for-platform.js";

export function listOutlineItemIndicesForPlatform(
	outline: JobOutlineForTabCount,
	platform: PlatformId,
): number[] {
	return outline.items
		.filter((item) => item.targets.includes(platform))
		.map((item) => item.itemIndex)
		.sort((left, right) => left - right);
}
