import { CanonicalJobSchema, type CanonicalJob } from "../schema/canonical-job";

export type JobValidationResult =
	| { ok: true; job: CanonicalJob }
	| { ok: false; errorMessage: string };

export function validateJob(input: unknown): JobValidationResult {
	const parsed = CanonicalJobSchema.safeParse(input);
	if (parsed.success) return { ok: true, job: parsed.data };
	return { ok: false, errorMessage: parsed.error.message };
}
