import { ApplyPhase, Platform, type ApplyPhase as ApplyPhaseType } from "@yanxu/domain";
import { activateChannelsTabForApply } from "./activate-tab-for-apply.js";
import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";
import { appendBatchProgress } from "../shared/batch-progress-store.js";
import { BatchProgressKind } from "../shared/batch-progress.js";
import {
	applyBatchItemViaNativeHost,
	type ApplyBatchItemViaNativeHostInput,
} from "./apply-batch-item-via-native-host.js";
import type { BatchApplySlot } from "./build-batch-apply-slots.js";
import { formatBatchSlotFailure } from "./format-batch-slot-failure.js";
import { waitRandomStaggerMs } from "./wait-random-stagger-ms.js";
import { UPLOAD_DAILY_LIMIT, acquireVideoUploadPermit } from "./upload-rate-limit.js";

export const BATCH_PARTIAL_FAILED_CODE = "batch_partial_failed" as const;

const RATE_LIMIT_CODES: readonly string[] = [
	"upload_daily_limit_reached",
	"upload_rate_limit_unavailable",
];

export type BatchSlotApplyOptions = {
	includeHorizontalCover?: boolean;
};

type SlotApplyOutcome = {
	slot: BatchApplySlot;
	result: ApplyJobFromRuntimeResult;
};

function groupSlotsByPlatform(slots: BatchApplySlot[]): Map<string, BatchApplySlot[]> {
	const grouped = new Map<string, BatchApplySlot[]>();
	for (const slot of slots) {
		const list = grouped.get(slot.platform) ?? [];
		list.push(slot);
		grouped.set(slot.platform, list);
	}
	return grouped;
}

async function requestUploadPermit(
	slot: BatchApplySlot,
): Promise<ApplyJobFromRuntimeResult | null> {
	try {
		const permit = await acquireVideoUploadPermit(slot.platform);
		if (permit.allowed) return null;
		const availableAt = new Date(permit.retryAt).toLocaleString("zh-CN");
		return {
			ok: false,
			code: "upload_daily_limit_reached",
			message: `已达 24 小时 ${String(UPLOAD_DAILY_LIMIT)} 次上传上限，${availableAt} 后可继续`,
		};
	} catch (error: unknown) {
		const detail = error instanceof Error ? error.message : "rate_limit_check_failed";
		return {
			ok: false,
			code: "upload_rate_limit_unavailable",
			message: `无法确认上传额度：${detail}`,
		};
	}
}

async function applyOneSlotWithStagger(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	slot: BatchApplySlot,
	options: BatchSlotApplyOptions,
): Promise<ApplyJobFromRuntimeResult> {
	await waitRandomStaggerMs();

	if (applyPhase !== ApplyPhase.FieldsOnly) {
		const denied = await requestUploadPermit(slot);
		if (denied) return denied;
	}

	const input: ApplyBatchItemViaNativeHostInput = {
		jobFilePath,
		applyPhase,
		tabId: slot.tabId,
		itemIndex: slot.itemIndex,
		platform: slot.platform,
		includeHorizontalCover: options.includeHorizontalCover,
	};

	const result = await applyBatchItemViaNativeHost(input);
	if (!result.ok) return result;

	const phaseLabel =
		applyPhase === ApplyPhase.VideoOnly
			? "video attached"
			: applyPhase === ApplyPhase.FieldsOnly
				? "fields filled for tab"
				: "video and fields applied";
	await appendBatchProgress({
		at: Date.now(),
		requestId,
		platform: slot.platform,
		itemIndex: slot.itemIndex,
		kind: BatchProgressKind.Slot,
		label: phaseLabel,
	});

	return { ok: true };
}

function summarizeSlotFailures(failures: SlotApplyOutcome[]): string {
	return failures
		.map(({ slot, result }) => formatBatchSlotFailure(slot, result))
		.filter((line) => line.length > 0)
		.join("; ");
}

async function reportSlotFailures(
	requestId: string,
	failures: SlotApplyOutcome[],
): Promise<void> {
	for (const { slot, result } of failures) {
		if (result.ok) continue;
		await appendBatchProgress({
			at: Date.now(),
			requestId,
			platform: slot.platform,
			itemIndex: slot.itemIndex,
			kind: BatchProgressKind.Warning,
			label: formatBatchSlotFailure(slot, result),
		});
	}
}

function resolvePlatformSlotResults(outcomes: SlotApplyOutcome[]): ApplyJobFromRuntimeResult {
	const failures = outcomes.filter(({ result }) => !result.ok);
	if (failures.length === 0) return { ok: true };

	const rateLimited = failures.find(
		({ result }) => !result.ok && RATE_LIMIT_CODES.includes(result.code),
	);
	if (rateLimited) return rateLimited.result;

	if (failures.length === outcomes.length) {
		return failures[0]?.result ?? { ok: false, code: "tab_apply_failed", message: "unknown" };
	}

	return {
		ok: false,
		code: BATCH_PARTIAL_FAILED_CODE,
		message: summarizeSlotFailures(failures),
	};
}

function platformAppliesSlotsSequentially(platform: string): boolean {
	return platform === Platform.Channels || platform === Platform.Bilibili;
}

async function applySlotsInOrder(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	platformSlots: BatchApplySlot[],
	options: BatchSlotApplyOptions,
): Promise<SlotApplyOutcome[]> {
	const outcomes: SlotApplyOutcome[] = [];
	for (const slot of platformSlots) {
		outcomes.push({
			slot,
			result: await applyOneSlotWithStagger(jobFilePath, applyPhase, requestId, slot, options),
		});
	}
	return outcomes;
}

async function applySlotsConcurrently(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	platformSlots: BatchApplySlot[],
	options: BatchSlotApplyOptions,
): Promise<SlotApplyOutcome[]> {
	return Promise.all(
		platformSlots.map(async (slot) => ({
			slot,
			result: await applyOneSlotWithStagger(jobFilePath, applyPhase, requestId, slot, options),
		})),
	);
}

async function applyPlatformSlots(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	platformSlots: BatchApplySlot[],
	options: BatchSlotApplyOptions,
): Promise<ApplyJobFromRuntimeResult> {
	const platform = platformSlots[0]?.platform ?? "";
	const firstSlot = platformSlots[0];
	if (platform === Platform.Channels && firstSlot) {
		await activateChannelsTabForApply(firstSlot.tabId);
	}
	const outcomes = platformAppliesSlotsSequentially(platform)
		? await applySlotsInOrder(jobFilePath, applyPhase, requestId, platformSlots, options)
		: await applySlotsConcurrently(jobFilePath, applyPhase, requestId, platformSlots, options);

	const failures = outcomes.filter(({ result }) => !result.ok);
	await reportSlotFailures(requestId, failures);

	return resolvePlatformSlotResults(outcomes);
}

function mergePlatformApplyResults(
	results: readonly ApplyJobFromRuntimeResult[],
): ApplyJobFromRuntimeResult {
	const failures = results.filter((result) => !result.ok);
	if (failures.length === 0) return { ok: true };

	if (failures.length === results.length) {
		return failures[0] ?? { ok: false, code: "tab_apply_failed", message: "unknown" };
	}

	return {
		ok: false,
		code: BATCH_PARTIAL_FAILED_CODE,
		message: failures.map((result) => result.message).join("; "),
	};
}

export async function applyBatchSlotsConcurrentByPlatform(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	slots: BatchApplySlot[],
	options: BatchSlotApplyOptions = {},
): Promise<ApplyJobFromRuntimeResult> {
	const grouped = groupSlotsByPlatform(slots);
	const channelsSlots = grouped.get(Platform.Channels) ?? [];
	if (channelsSlots.length > 0) grouped.delete(Platform.Channels);

	const otherPlatformRuns = [...grouped.values()].map((platformSlots) =>
		applyPlatformSlots(jobFilePath, applyPhase, requestId, platformSlots, options),
	);
	const otherResults =
		otherPlatformRuns.length > 0 ? await Promise.all(otherPlatformRuns) : [];

	const channelsResult =
		channelsSlots.length > 0
			? await applyPlatformSlots(jobFilePath, applyPhase, requestId, channelsSlots, options)
			: { ok: true as const };

	return mergePlatformApplyResults([...otherResults, channelsResult]);
}
