import { ApplyPhase, Platform } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { clampFieldsSettleMs } from "../shared/fields-settle-config.js";
import { markBatchVideosUploaded } from "../shared/batch-upload-state.js";
import { waitMs } from "../content/wait-ms.js";
import { BATCH_PARTIAL_FAILED_CODE } from "./apply-batch-slots-by-platform.js";
import { applyBatchSlotsConcurrentByPlatform } from "./apply-batch-slots-by-platform.js";
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

async function applyDouyinUploadThenFill(
	jobFilePath: string,
	requestId: string,
	slots: BatchApplySlot[],
	fieldsSettleMs: number,
): Promise<ApplyJobFromRuntimeResult> {
	if (slots.length === 0) return { ok: true };

	const uploadResult = await applyBatchSlotsConcurrentByPlatform(
		jobFilePath,
		ApplyPhase.VideoOnly,
		requestId,
		slots,
	);
	if (!uploadResult.ok && uploadResult.code !== BATCH_PARTIAL_FAILED_CODE) {
		return uploadResult;
	}

	await markBatchVideosUploaded(jobFilePath);
	if (fieldsSettleMs > 0) await waitMs(fieldsSettleMs);

	const fillResult = await applyBatchSlotsConcurrentByPlatform(
		jobFilePath,
		ApplyPhase.FieldsOnly,
		requestId,
		slots,
	);
	if (uploadResult.ok) return fillResult;
	if (fillResult.ok) return uploadResult;
	return mergePartialResults(uploadResult, fillResult);
}

async function applyPlatformUploadThenFill(
	jobFilePath: string,
	requestId: string,
	slots: BatchApplySlot[],
	fieldsSettleMs: number,
): Promise<ApplyJobFromRuntimeResult> {
	if (slots.length === 0) return { ok: true };

	const platform = slots[0]?.platform ?? "unknown";

	const uploadResult = await applyBatchSlotsConcurrentByPlatform(
		jobFilePath,
		ApplyPhase.VideoOnly,
		requestId,
		slots,
	);
	if (!uploadResult.ok && uploadResult.code !== BATCH_PARTIAL_FAILED_CODE) {
		if (platform !== Platform.Channels) {
			return uploadResult;
		}
	}

	await markBatchVideosUploaded(jobFilePath);
	if (fieldsSettleMs > 0) await waitMs(fieldsSettleMs);

	const fillResult = await applyBatchSlotsConcurrentByPlatform(
		jobFilePath,
		ApplyPhase.FieldsOnly,
		requestId,
		slots,
	);
	if (uploadResult.ok && fillResult.ok) return { ok: true };
	if (uploadResult.ok) return fillResult;
	if (fillResult.ok) return { ok: true };
	return mergePartialResults(uploadResult, fillResult);
}

export async function applyUploadThenFillAllTabs(
	jobFilePath: string,
	requestId: string,
	fieldsSettleMs: number,
): Promise<ApplyJobFromRuntimeResult> {
	return runWithServiceWorkerKeepAlive(async () => {
		const settleMs = clampFieldsSettleMs(fieldsSettleMs);

		const prepared = await prepareBatchApplyContext(jobFilePath);
		if (!("slots" in prepared)) return prepared;

		await clearBatchProgress(requestId);

		const douyinSlots = prepared.slots.filter((slot) => slot.platform === Platform.Douyin);
		const bilibiliSlots = prepared.slots.filter((slot) => slot.platform === Platform.Bilibili);
		const channelsSlots = prepared.slots.filter((slot) => slot.platform === Platform.Channels);

		const [bilibiliResult, channelsResult, douyinResult] = await Promise.all([
			applyPlatformUploadThenFill(jobFilePath, requestId, bilibiliSlots, settleMs),
			applyPlatformUploadThenFill(jobFilePath, requestId, channelsSlots, settleMs),
			applyDouyinUploadThenFill(jobFilePath, requestId, douyinSlots, settleMs),
		]);

		if (bilibiliResult.ok && channelsResult.ok) return douyinResult;
		if (bilibiliResult.ok && douyinResult.ok) return channelsResult;
		if (channelsResult.ok && douyinResult.ok) return bilibiliResult;
		return mergePartialResults(
			mergePartialResults(bilibiliResult, channelsResult),
			douyinResult,
		);
	});
}
