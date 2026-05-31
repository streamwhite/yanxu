import { ApplyPhase, Platform, type ApplyPhase as ApplyPhaseType } from "@auto-upload/domain";
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

export const BATCH_PARTIAL_FAILED_CODE = "batch_partial_failed" as const;

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

async function applyOneSlotWithStagger(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	slot: BatchApplySlot,
): Promise<ApplyJobFromRuntimeResult> {
	await waitRandomStaggerMs();

	const input: ApplyBatchItemViaNativeHostInput = {
		jobFilePath,
		applyPhase,
		tabId: slot.tabId,
		itemIndex: slot.itemIndex,
		platform: slot.platform,
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
): Promise<SlotApplyOutcome[]> {
	const outcomes: SlotApplyOutcome[] = [];
	for (const slot of platformSlots) {
		outcomes.push({
			slot,
			result: await applyOneSlotWithStagger(jobFilePath, applyPhase, requestId, slot),
		});
	}
	return outcomes;
}

async function applySlotsConcurrently(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	platformSlots: BatchApplySlot[],
): Promise<SlotApplyOutcome[]> {
	return Promise.all(
		platformSlots.map(async (slot) => ({
			slot,
			result: await applyOneSlotWithStagger(jobFilePath, applyPhase, requestId, slot),
		})),
	);
}

async function applyPlatformSlots(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	platformSlots: BatchApplySlot[],
): Promise<ApplyJobFromRuntimeResult> {
	const platform = platformSlots[0]?.platform ?? "";
	const outcomes = platformAppliesSlotsSequentially(platform)
		? await applySlotsInOrder(jobFilePath, applyPhase, requestId, platformSlots)
		: await applySlotsConcurrently(jobFilePath, applyPhase, requestId, platformSlots);

	const failures = outcomes.filter(({ result }) => !result.ok);
	await reportSlotFailures(requestId, failures);

	return resolvePlatformSlotResults(outcomes);
}

export async function applyBatchSlotsConcurrentByPlatform(
	jobFilePath: string,
	applyPhase: ApplyPhaseType,
	requestId: string,
	slots: BatchApplySlot[],
): Promise<ApplyJobFromRuntimeResult> {
	const grouped = groupSlotsByPlatform(slots);
	const platformRuns = [...grouped.values()].map((platformSlots) =>
		applyPlatformSlots(jobFilePath, applyPhase, requestId, platformSlots),
	);

	const results = await Promise.all(platformRuns);
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
