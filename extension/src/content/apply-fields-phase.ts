import type { AppliedJobPayload, CanonicalJob } from "@auto-upload/domain";
import { applyCoverAttachment } from "./apply-cover-attachment.js";
import { resolvePageFieldsForJob } from "./bilibili-default-fields.js";
import { blurActiveElement } from "./blur-active-element.js";
import { FIELDS_BEFORE_COVER_DELAY_MS } from "./constants/cover-modal-timing.js";
import { applyPageFields } from "./page-fields.js";
import { waitMs } from "./wait-ms.js";

function applyAllPageFields(job: CanonicalJob): void {
	const fields = resolvePageFieldsForJob(job);
	const missing = applyPageFields(document, fields);
	if (missing.length > 0) {
		throw new Error(`page_fields_not_found:${missing.join(", ")}`);
	}
}

/** Page fields first; cover modal upload last (after UI settles). */
export async function applyFieldsPhase(
	job: CanonicalJob,
	payload: AppliedJobPayload,
): Promise<void> {
	applyAllPageFields(job);
	await waitMs(FIELDS_BEFORE_COVER_DELAY_MS);
	blurActiveElement();
	await applyCoverAttachment(payload);
}
