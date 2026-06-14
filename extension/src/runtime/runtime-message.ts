import { z } from "zod";
import { ApplyPhase, PLATFORM_IDS } from "@auto-upload/domain";
import { MAX_FIELDS_SETTLE_MS, MIN_FIELDS_SETTLE_MS } from "../shared/fields-settle-config.js";

export const RuntimeMessageType = {
	Ping: "runtime.ping",
	UploadAllTabs: "runtime.uploadAllTabs",
	FillAllTabs: "runtime.fillAllTabs",
	UploadAndFillAllTabs: "runtime.uploadAndFillAllTabs",
	OpenPlatformTabs: "runtime.openPlatformTabs",
	OpenAllPlatformTabs: "runtime.openAllPlatformTabs",
} as const;

const RuntimeBatchJobRequestBase = z.object({
	requestId: z.string().min(1),
	jobFilePath: z.string().min(1),
});

export const RuntimeUploadAllTabsMessageSchema = RuntimeBatchJobRequestBase.extend({
	type: z.literal(RuntimeMessageType.UploadAllTabs),
});

export const RuntimeFillAllTabsMessageSchema = RuntimeBatchJobRequestBase.extend({
	type: z.literal(RuntimeMessageType.FillAllTabs),
});

export const RuntimeUploadAndFillAllTabsMessageSchema = RuntimeBatchJobRequestBase.extend({
	type: z.literal(RuntimeMessageType.UploadAndFillAllTabs),
	fieldsSettleMs: z.number().int().min(MIN_FIELDS_SETTLE_MS).max(MAX_FIELDS_SETTLE_MS).optional(),
	channelsOnly: z.boolean().optional(),
});

const PlatformIdSchema = z.enum(PLATFORM_IDS);

export const RuntimeOpenPlatformTabsMessageSchema = RuntimeBatchJobRequestBase.extend({
	type: z.literal(RuntimeMessageType.OpenPlatformTabs),
	platform: PlatformIdSchema,
});

export const RuntimeOpenAllPlatformTabsMessageSchema = RuntimeBatchJobRequestBase.extend({
	type: z.literal(RuntimeMessageType.OpenAllPlatformTabs),
	channelsOnly: z.boolean().optional(),
});

export type ApplyJobFromRuntimeResult = { ok: true } | { ok: false; code: string; message: string };

export const RUNTIME_APPLY_PHASE_BY_MESSAGE_TYPE = {
	[RuntimeMessageType.UploadAllTabs]: ApplyPhase.VideoOnly,
	[RuntimeMessageType.FillAllTabs]: ApplyPhase.FieldsOnly,
} as const;
