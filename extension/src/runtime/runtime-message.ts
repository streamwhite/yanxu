import { z } from "zod";
import { ApplyPhase, JobFileOutlineSchema, PLATFORM_IDS } from "@auto-upload/domain";
import { MAX_FIELDS_SETTLE_MS, MIN_FIELDS_SETTLE_MS } from "../shared/fields-settle-config.js";
import {
	MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
	MAX_CHANNELS_SUBMIT_BATCH_SIZE,
	MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN,
	MIN_CHANNELS_SUBMIT_BATCH_SIZE,
	MS_PER_MINUTE,
} from "../shared/channels-submit-batch-config.js";

export const RuntimeMessageType = {
	Ping: "runtime.ping",
	InspectJobFile: "runtime.inspectJobFile",
	UploadAllTabs: "runtime.uploadAllTabs",
	FillAllTabs: "runtime.fillAllTabs",
	UploadAndFillAllTabs: "runtime.uploadAndFillAllTabs",
	OpenPlatformTabs: "runtime.openPlatformTabs",
	OpenAllPlatformTabs: "runtime.openAllPlatformTabs",
	SubmitPlatformTabs: "runtime.submitPlatformTabs",
} as const;

const RuntimeBatchJobRequestBase = z.object({
	requestId: z.string().min(1),
	jobFilePath: z.string().min(1),
});

export const RuntimeInspectJobFileMessageSchema = z.object({
	type: z.literal(RuntimeMessageType.InspectJobFile),
	jobFilePath: z.string().min(1),
});

export type InspectJobFileRuntimeResult =
	| { ok: true; outline: z.infer<typeof JobFileOutlineSchema> }
	| { ok: false; code: string; message: string };

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
	selectedChannelsItemIndices: z.array(z.number().int().nonnegative()).optional(),
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

export const RuntimeSubmitPlatformTabsMessageSchema = z.object({
	requestId: z.string().min(1),
	type: z.literal(RuntimeMessageType.SubmitPlatformTabs),
	platform: PlatformIdSchema,
	channelsSubmitBatchSize: z
		.number()
		.int()
		.min(MIN_CHANNELS_SUBMIT_BATCH_SIZE)
		.max(MAX_CHANNELS_SUBMIT_BATCH_SIZE)
		.optional(),
	channelsSubmitBatchIntervalMs: z
		.number()
		.int()
		.min(MIN_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN * MS_PER_MINUTE)
		.max(MAX_CHANNELS_SUBMIT_BATCH_INTERVAL_MIN * MS_PER_MINUTE)
		.optional(),
});

export type ApplyJobFromRuntimeResult = { ok: true } | { ok: false; code: string; message: string };

export const RUNTIME_APPLY_PHASE_BY_MESSAGE_TYPE = {
	[RuntimeMessageType.UploadAllTabs]: ApplyPhase.VideoOnly,
	[RuntimeMessageType.FillAllTabs]: ApplyPhase.FieldsOnly,
} as const;
