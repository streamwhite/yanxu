import { CanonicalJobSchema, type CanonicalJob } from "../schema/canonical-job";
import { formatZodValidationError } from "./format-zod-validation-error.js";

export type JobValidationResult =
	| { ok: true; job: CanonicalJob }
	| { ok: false; errorMessage: string };

export function validateJob(input: unknown): JobValidationResult {
	const parsed = CanonicalJobSchema.safeParse(input);
	if (parsed.success) return { ok: true, job: parsed.data };
	return { ok: false, errorMessage: formatZodValidationError(parsed.error) };
}
