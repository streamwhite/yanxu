import { BatchProgressKind } from "../shared/batch-progress.js";
import { reportApplyProgress } from "./report-apply-progress.js";
import type { ApplyPageFieldsProgressContext } from "./page-fields.js";

const SKIPPED_FIELD_LABEL_PREFIX = "skipped field:" as const;

export function reportSkippedPageFields(
	missingLabels: readonly string[],
	progress: ApplyPageFieldsProgressContext,
): void {
	for (const label of missingLabels) {
		reportApplyProgress({
			platform: progress.platform,
			itemIndex: progress.itemIndex,
			kind: BatchProgressKind.Warning,
			label: `${SKIPPED_FIELD_LABEL_PREFIX} ${label}`,
		});
	}
}
