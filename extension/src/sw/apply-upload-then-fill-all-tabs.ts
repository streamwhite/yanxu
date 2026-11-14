import { ApplyPhase, Platform } from "@yanxu/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import type { BatchPlatformScope } from "../shared/batch-platform-scope.js";
import { isSinglePlatformScope } from "../shared/batch-platform-scope.js";
import { clampFieldsSettleMs } from "../shared/fields-settle-config.js";
import { markBatchVideosUploaded } from "../shared/batch-upload-state.js";
import { waitMs } from "../content/wait-ms.js";
import { BATCH_PARTIAL_FAILED_CODE } from "./apply-batch-slots-by-platform.js";
import {
	applyBatchSlotsConcurrentByPlatform,
	type BatchSlotApplyOptions,
} from "./apply-batch-slots-by-platform.js";
import { checkBatchJobAssets } from "./check-batch-job-assets.js";
import { prepareBatchApplyContext } from "./prepare-batch-apply-context.js";
import { runWithServiceWorkerKeepAlive } from "./run-with-service-worker-keep-alive.js";
import { clearBatchProgress } from "../shared/batch-progress-store.js";
import type { BatchApplySlot } from "./build-batch-apply-slots.js";

function mergePartialResults(
	first: ApplyJobFromRuntimeResult,
	second: ApplyJobFromRuntimeResult,
): ApplyJobFromRuntimeResult {
	if (first.ok) return second;
	if (second.ok) return first;
	return {
		ok: false,
		code: BATCH_PARTIAL_FAILED_CODE,
		message: `${first.message}; ${second.message}`,
	};
}

async function applySlotsPhase(
	jobFilePath: string,
	applyPhase: typeof ApplyPhase.VideoOnly | typeof ApplyPhase.FieldsOnly,
	requestId: string,
	slots: BatchApplySlot[],
	options: BatchSlotApplyOptions,
): Promise<ApplyJobFromRuntimeResult> {
	if (slots.length === 0) return { ok: true };
	return applyBatchSlotsConcurrentByPlatform(jobFilePath, applyPhase, requestId, slots, options);
}


function combinePlatformUploadAndFill(
	upload: ApplyJobFromRuntimeResult,
	fill: ApplyJobFromRuntimeResult,
	allowFillAfterUploadFailure: boolean,
): ApplyJobFromRuntimeResult {
	if (
		!upload.ok &&
		(upload.code === "upload_daily_limit_reached" ||
			upload.code === "upload_rate_limit_unavailable")
	) {
		return upload;
	}
	if (upload.ok && fill.ok) return { ok: true };
	if (upload.ok) return fill;
	if (fill.ok && allowFillAfterUploadFailure) return { ok: true };
	if (fill.ok) return upload;
	return mergePartialResults(upload, fill);
}

export type ApplyUploadThenFillAllTabsOptions = {
	submitHorizontalCover?: boolean;
	selectedPlatformItemIndices?: number[];
};

export async function applyUploadThenFillAllTabs(
	jobFilePath: string,
	requestId: string,
	fieldsSettleMs: number,
	batchPlatformScope: BatchPlatformScope,
	options: ApplyUploadThenFillAllTabsOptions = {},
): Promise<ApplyJobFromRuntimeResult> {
	return runWithServiceWorkerKeepAlive(async () => {
		const settleMs = clampFieldsSettleMs(fieldsSettleMs);
		const scopedPlatform = isSinglePlatformScope(batchPlatformScope)
			? batchPlatformScope
			: undefined;
		const slotOptions: BatchSlotApplyOptions = {
			includeHorizontalCover: options.submitHorizontalCover === true,
		};

		const prepared = await prepareBatchApplyContext(jobFilePath, {
			batchPlatformScope,
			selectedPlatformItemIndices:
				scopedPlatform === undefined ? undefined : options.selectedPlatformItemIndices,
		});

		if (!("slots" in prepared)) return prepared;

		if (slotOptions.includeHorizontalCover) {
			const assets = await checkBatchJobAssets(jobFilePath, { includeHorizontalCover: true });
			if (!assets.ok) return assets;
		}

		await clearBatchProgress(requestId);

		const douyinSlots = prepared.slots.filter((slot) => slot.platform === Platform.Douyin);
		const bilibiliSlots = prepared.slots.filter((slot) => slot.platform === Platform.Bilibili);
		const channelsSlots = prepared.slots.filter((slot) => slot.platform === Platform.Channels);

		const [bilibiliUpload, douyinUpload] = await Promise.all([
			applySlotsPhase(jobFilePath, ApplyPhase.VideoOnly, requestId, bilibiliSlots, slotOptions),
			applySlotsPhase(jobFilePath, ApplyPhase.VideoOnly, requestId, douyinSlots, slotOptions),
		]);
		const channelsUpload = await applySlotsPhase(
			jobFilePath,
			ApplyPhase.VideoOnly,
			requestId,
			channelsSlots,
			slotOptions,
		);

		await markBatchVideosUploaded(jobFilePath);
		if (settleMs > 0) await waitMs(settleMs);

		const [bilibiliFill, douyinFill, channelsFill] = await Promise.all([
			applySlotsPhase(jobFilePath, ApplyPhase.FieldsOnly, requestId, bilibiliSlots, slotOptions),
			applySlotsPhase(jobFilePath, ApplyPhase.FieldsOnly, requestId, douyinSlots, slotOptions),
			applySlotsPhase(jobFilePath, ApplyPhase.FieldsOnly, requestId, channelsSlots, slotOptions),
		]);


		const bilibiliResult = combinePlatformUploadAndFill(bilibiliUpload, bilibiliFill, false);
		const douyinResult = combinePlatformUploadAndFill(douyinUpload, douyinFill, false);
		const channelsResult = combinePlatformUploadAndFill(channelsUpload, channelsFill, true);

		if (bilibiliResult.ok && channelsResult.ok) return douyinResult;
		if (bilibiliResult.ok && douyinResult.ok) return channelsResult;
		if (channelsResult.ok && douyinResult.ok) return bilibiliResult;
		return mergePartialResults(mergePartialResults(bilibiliResult, channelsResult), douyinResult);
	});
}
