import { Platform, type PlatformId } from "../constants/platform";
import type { CanonicalJob } from "../schema/canonical-job";
import { getJobPlatform } from "./get-job-platform.js";

function platformBlockHasTitle(job: CanonicalJob, platform: PlatformId): boolean {
	if (job.jobVersion === 1) {
		return platform === Platform.Bilibili && Boolean(job.bilibili.title?.trim());
	}

	if (platform === Platform.Bilibili) return Boolean(job.bilibili?.title?.trim());
	if (platform === Platform.Douyin) return Boolean(job.douyin?.title?.trim());
	return Boolean(job.channels?.title?.trim());
}

export function jobHasDefaultTitle(job: CanonicalJob): boolean {
	return platformBlockHasTitle(job, getJobPlatform(job));
}
