import { getJobPlatform, Platform, type AppliedJobPayload, type CanonicalJob } from "@auto-upload/domain";
import { CHANNELS_BEFORE_COVER_SETTLE_MS } from "../platforms/channels/constants/channels-cover-timing.js";
import { waitForChannelsVideoUploadComplete } from "../platforms/channels/wait-for-channels-video-upload-complete.js";
import { blurActiveFieldBeforeCover } from "./blur-active-field-before-cover.js";
import { waitMs } from "./wait-ms.js";
import { platformSupportsCoverUpload } from "../platforms/platform-supports-cover-upload.js";
import { resolvePageFieldsForJob } from "../platforms/resolve-page-fields-for-job.js";
import { applyCoverAttachment } from "./apply-cover-attachment.js";
import {
	applyPageFields,
	type ApplyPageFieldsProgressContext,
} from "./page-fields.js";
import { reportSkippedPageFields } from "./report-skipped-page-fields.js";
import { reportApplyProgress } from "./report-apply-progress.js";
import { BatchProgressKind } from "../shared/batch-progress.js";
import { jobHasCoverToApply } from "./job-has-cover-to-apply.js";
import { waitForFieldsReadyBeforeCover } from "./wait-for-fields-ready-before-cover.js";
import { waitForPageFieldsReady } from "./wait-for-page-fields-ready.js";

const FORM_NOT_READY_WARNING = "form not ready, attempting fields anyway" as const;

function buildFieldsProgressContext(
	job: CanonicalJob,
	payload: AppliedJobPayload,
): ApplyPageFieldsProgressContext {
	return {
		platform: getJobPlatform(job),
		itemIndex: payload.batch.itemIndex,
	};
}

async function applyAllPageFields(
	job: CanonicalJob,
	progress: ApplyPageFieldsProgressContext,
): Promise<void> {
	const fields = resolvePageFieldsForJob(job);
	const missing = await applyPageFields(document, fields, progress);
	reportSkippedPageFields(missing, progress);
}

async function waitForFormReadyOrWarn(
	job: CanonicalJob,
	progress: ApplyPageFieldsProgressContext,
): Promise<void> {
	try {
		await waitForPageFieldsReady(job);
	} catch {
		reportApplyProgress({
			platform: progress.platform,
			itemIndex: progress.itemIndex,
			kind: BatchProgressKind.Warning,
			label: FORM_NOT_READY_WARNING,
		});
	}
}

/** Text/radio/tags/partition first; cover upload last when the platform supports it. */
export async function applyFieldsPhase(
	job: CanonicalJob,
	payload: AppliedJobPayload,
): Promise<void> {
	const progress = buildFieldsProgressContext(job, payload);
	await waitForFormReadyOrWarn(job, progress);
	await applyAllPageFields(job, progress);

	const platform = getJobPlatform(job);
	const hasCover = jobHasCoverToApply(payload);
	const supportsCover = platformSupportsCoverUpload(platform);

	if (platform === Platform.Channels && hasCover && supportsCover) {
		await waitForChannelsVideoUploadComplete(document);
		blurActiveFieldBeforeCover();
		await waitMs(CHANNELS_BEFORE_COVER_SETTLE_MS);
	}

	if (!hasCover) return;
	if (!supportsCover) return;

	await waitForFieldsReadyBeforeCover(job);
	await applyCoverAttachment(payload);
	reportApplyProgress({
		platform: progress.platform,
		itemIndex: progress.itemIndex,
		kind: BatchProgressKind.Cover,
		label: "cover attached",
	});
}
