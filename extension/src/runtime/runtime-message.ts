import { z } from "zod";
import { ApplyPhase } from "@auto-upload/domain";

export const RuntimeMessageType = {
	Ping: "runtime.ping",
	UploadVideoFirst: "runtime.uploadVideoFirst",
	FillFieldsFromFile: "runtime.fillFieldsFromFile",
	ApplyJobFromFile: "runtime.applyJobFromFile",
} as const;

const RuntimeJobFileRequestBase = z.object({
	requestId: z.string().min(1),
	jobFilePath: z.string().min(1),
	tabId: z.number().int().positive().optional(),
});

export const RuntimeUploadVideoFirstMessageSchema = RuntimeJobFileRequestBase.extend({
	type: z.literal(RuntimeMessageType.UploadVideoFirst),
});

export const RuntimeFillFieldsMessageSchema = RuntimeJobFileRequestBase.extend({
	type: z.literal(RuntimeMessageType.FillFieldsFromFile),
});

export const RuntimeApplyJobFromFileMessageSchema = RuntimeJobFileRequestBase.extend({
	type: z.literal(RuntimeMessageType.ApplyJobFromFile),
});

export type ApplyJobFromRuntimeResult = { ok: true } | { ok: false; code: string; message: string };

export const RUNTIME_APPLY_PHASE_BY_MESSAGE_TYPE = {
	[RuntimeMessageType.UploadVideoFirst]: ApplyPhase.VideoOnly,
	[RuntimeMessageType.FillFieldsFromFile]: ApplyPhase.FieldsOnly,
	[RuntimeMessageType.ApplyJobFromFile]: ApplyPhase.Full,
} as const;
