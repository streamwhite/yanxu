import { EXTENSION_BATCH_JOB_VERSION } from "./constants/batch-job-version.js";
import type { InspectJobOutlineResult } from "./inspect-job-file-outline.js";

const ERROR_BATCH_JOB_REQUIRED = "batch_job_required" as const;

export function assertBatchJobOutline(
	inspected: Extract<InspectJobOutlineResult, { ok: true }>,
): { ok: true } | { ok: false; code: string; message: string } {
	if (inspected.outline.jobVersion !== EXTENSION_BATCH_JOB_VERSION) {
		return {
			ok: false,
			code: ERROR_BATCH_JOB_REQUIRED,
			message: `Extension supports batch jobs only (jobVersion ${String(EXTENSION_BATCH_JOB_VERSION)}). Use examples/batch.job.example.json.`,
		};
	}
	return { ok: true };
}
