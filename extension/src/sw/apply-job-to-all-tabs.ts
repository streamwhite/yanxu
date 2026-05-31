import type { ApplyPhase } from "@auto-upload/domain";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { clearBatchProgress } from "../shared/batch-progress-store.js";
import { applyBatchSlotsConcurrentByPlatform } from "./apply-batch-slots-by-platform.js";
import { prepareBatchApplyContext } from "./prepare-batch-apply-context.js";
import { acquireServiceWorkerKeepAlive } from "./service-worker-keep-alive.js";

export async function applyJobToAllTabs(
	jobFilePath: string,
	applyPhase: ApplyPhase,
	requestId: string,
): Promise<ApplyJobFromRuntimeResult> {
	const releaseKeepAlive = acquireServiceWorkerKeepAlive();

	try {
		const prepared = await prepareBatchApplyContext(jobFilePath);
		if (!("slots" in prepared)) return prepared;

		await clearBatchProgress(requestId);
		return applyBatchSlotsConcurrentByPlatform(
			jobFilePath,
			applyPhase,
			requestId,
			prepared.slots,
		);
	} finally {
		releaseKeepAlive();
	}
}
