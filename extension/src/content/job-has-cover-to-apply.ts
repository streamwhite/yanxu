import type { AppliedJobPayload } from "@auto-upload/domain";

export function jobHasCoverToApply(payload: AppliedJobPayload): boolean {
	return payload.attachments.cover.kind !== "skipped";
}
