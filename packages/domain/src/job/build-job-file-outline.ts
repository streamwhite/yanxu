import type { PlatformId } from "../constants/platform";
import type { BatchJob } from "../schema/batch-job";
import type { CanonicalJob } from "../schema/canonical-job";

export type JobFileOutlineItem = {
	itemIndex: number;
	targets: PlatformId[];
};

export type JobFileOutline = {
	jobVersion: number;
	items: JobFileOutlineItem[];
};

export function buildJobFileOutlineFromCanonical(job: CanonicalJob): JobFileOutline {
	return {
		jobVersion: job.jobVersion,
		items: [{ itemIndex: 0, targets: [...job.targets] }],
	};
}

export function buildJobFileOutlineFromBatch(batch: BatchJob): JobFileOutline {
	return {
		jobVersion: batch.jobVersion,
		items: batch.items.map((item, itemIndex) => ({
			itemIndex,
			targets: [...item.targets],
		})),
	};
}

export function buildJobFileOutline(job: CanonicalJob | BatchJob): JobFileOutline {
	if (job.jobVersion === 3) return buildJobFileOutlineFromBatch(job);
	return buildJobFileOutlineFromCanonical(job);
}
