import {
	buildJobFileOutline,
	normalizeBatchJobTexts,
	normalizeCanonicalJobTexts,
	projectBatchItemToCanonicalJob,
	type CanonicalJob,
	type PlatformId,
	validateJobFile,
} from "@auto-upload/domain";

export type ResolvedCanonicalJobFromFile =
	| { ok: true; job: CanonicalJob }
	| { ok: false; code: string; message: string };

export function resolveCanonicalJobFromFileJson(
	rawJson: unknown,
	itemIndex?: number,
	platform?: PlatformId,
): ResolvedCanonicalJobFromFile {
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return { ok: false, code: "invalid_job", message: validated.errorMessage };
	}

	if (validated.kind === "canonical") {
		const job = normalizeCanonicalJobTexts(validated.job);
		return { ok: true, job };
	}

	const batch = normalizeBatchJobTexts(validated.job);
	if (itemIndex === undefined || platform === undefined) {
		return {
			ok: false,
			code: "batch_job_requires_item",
			message: "batch job requires itemIndex and platform",
		};
	}

	try {
		const projected = projectBatchItemToCanonicalJob(batch, itemIndex, platform);
		const job = normalizeCanonicalJobTexts(projected);
		return { ok: true, job };
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "batch_projection_failed";
		return { ok: false, code: "batch_projection_failed", message };
	}
}

export function inspectJobFileOutlineFromJson(rawJson: unknown) {
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return { ok: false as const, code: "invalid_job", message: validated.errorMessage };
	}

	if (validated.kind === "batch") {
		return { ok: true as const, outline: buildJobFileOutline(validated.job) };
	}

	return { ok: true as const, outline: buildJobFileOutline(validated.job) };
}
