import { BatchJobSchema, type BatchJob } from "../schema/batch-job";
import { CanonicalJobSchema, type CanonicalJob } from "../schema/canonical-job";

export type JobFileValidationResult =
	| { ok: true; kind: "canonical"; job: CanonicalJob }
	| { ok: true; kind: "batch"; job: BatchJob }
	| { ok: false; errorMessage: string };

export function validateJobFile(input: unknown): JobFileValidationResult {
	const batchParsed = BatchJobSchema.safeParse(input);
	if (batchParsed.success) {
		return { ok: true, kind: "batch", job: batchParsed.data };
	}

	const canonicalParsed = CanonicalJobSchema.safeParse(input);
	if (canonicalParsed.success) {
		return { ok: true, kind: "canonical", job: canonicalParsed.data };
	}

	return {
		ok: false,
		errorMessage: canonicalParsed.error.message,
	};
}
