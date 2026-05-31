import { Platform, type PlatformId } from "../constants/platform";
import type { CanonicalJob } from "../schema/canonical-job";

export function getJobPlatform(job: CanonicalJob): PlatformId {
	if (job.jobVersion === 1) return Platform.Bilibili;
	return job.platform;
}
