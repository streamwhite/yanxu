import type { AppliedJobPayload } from "@yanxu/domain";

export function jobHasCoverToApply(payload: AppliedJobPayload): boolean {
	return payload.attachments.cover.kind !== "skipped";
}
