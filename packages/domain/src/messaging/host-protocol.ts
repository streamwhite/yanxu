import { z } from "zod";
import { ApplyPhase } from "../apply/apply-phase";
import { PLATFORM_IDS } from "../constants/platform";
import { BatchApplyContextSchema } from "../schema/batch-apply-context";

const InlineBase64Chunks = z.object({
	kind: z.literal("inlineBase64Chunks"),
	mimeType: z.string().min(1),
	chunks: z.array(z.string().min(1)),
	suggestedFileName: z.string().min(1).optional(),
});

const ManualLargeFile = z.object({
	kind: z.literal("manualLargeFile"),
	absolutePath: z.string().min(1),
	sizeBytes: z.number().int().nonnegative(),
	reasonCode: z.string().min(1),
	suggestedFileName: z.string().min(1).optional(),
});

const VideoSkipped = z.object({
	kind: z.literal("skipped"),
	reasonCode: z.string().min(1),
});

export const AttachmentVideoPayloadSchema = z.discriminatedUnion("kind", [
	InlineBase64Chunks,
	ManualLargeFile,
	VideoSkipped,
]);

export type AttachmentVideoPayload = z.infer<typeof AttachmentVideoPayloadSchema>;

const CoverInlineBase64 = z.object({
	kind: z.literal("inlineBase64"),
	mimeType: z.string().min(1),
	base64: z.string().min(1),
});

const CoverInlineBase64Chunks = z.object({
	kind: z.literal("inlineBase64Chunks"),
	mimeType: z.string().min(1),
	chunks: z.array(z.string().min(1)),
});

const CoverSkipped = z.object({
	kind: z.literal("skipped"),
	reasonCode: z.string().min(1),
});

export const AttachmentCoverPayloadSchema = z.discriminatedUnion("kind", [
	CoverInlineBase64,
	CoverInlineBase64Chunks,
	CoverSkipped,
]);

export type AttachmentCoverPayload = z.infer<typeof AttachmentCoverPayloadSchema>;

export const AppliedJobPayloadSchema = z.object({
	applyPhase: z.enum([ApplyPhase.Full, ApplyPhase.VideoOnly, ApplyPhase.FieldsOnly]),
	jobJson: z.string().min(1),
	batch: BatchApplyContextSchema,
	attachments: z.object({
		video: AttachmentVideoPayloadSchema,
		cover: AttachmentCoverPayloadSchema,
	}),
});

export type AppliedJobPayload = z.infer<typeof AppliedJobPayloadSchema>;

const PlatformIdSchema = z.enum(PLATFORM_IDS);

export const JobFileOutlineItemSchema = z.object({
	itemIndex: z.number().int().nonnegative(),
	targets: z.array(PlatformIdSchema).min(1),
});

export const JobFileOutlineSchema = z.object({
	jobVersion: z.number().int().positive(),
	items: z.array(JobFileOutlineItemSchema).min(1),
});

export type JobFileOutlinePayload = z.infer<typeof JobFileOutlineSchema>;

export const HostInboundMessageSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("ping") }),
	z.object({
		type: z.literal("inspectJobFromFile"),
		jobFilePath: z.string().min(1),
	}),
	z.object({
		type: z.literal("checkBatchJobAssetsFromFile"),
		jobFilePath: z.string().min(1),
	}),
	z.object({
		type: z.literal("applyBatchItemFromFile"),
		jobFilePath: z.string().min(1),
		applyPhase: z.enum([ApplyPhase.Full, ApplyPhase.VideoOnly, ApplyPhase.FieldsOnly]),
		itemIndex: z.number().int().nonnegative(),
		platform: PlatformIdSchema,
	}),
]);

export type HostInboundMessage = z.infer<typeof HostInboundMessageSchema>;

export const VideoStreamStartSchema = z.object({
	type: z.literal("videoStreamStart"),
	mimeType: z.string().min(1),
	suggestedFileName: z.string().min(1),
	totalBytes: z.number().int().nonnegative(),
	chunkCount: z.number().int().nonnegative(),
});

export const VideoStreamChunkSchema = z.object({
	type: z.literal("videoStreamChunk"),
	index: z.number().int().nonnegative(),
	base64: z.string().min(1),
});

export const CoverStreamStartSchema = z.object({
	type: z.literal("coverStreamStart"),
	mimeType: z.string().min(1),
	suggestedFileName: z.string().min(1),
	totalBytes: z.number().int().nonnegative(),
	chunkCount: z.number().int().nonnegative(),
});

export const CoverStreamChunkSchema = z.object({
	type: z.literal("coverStreamChunk"),
	index: z.number().int().nonnegative(),
	base64: z.string().min(1),
});

export const HostOutboundMessageSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("pong") }),
	z.object({
		type: z.literal("jobFileOutline"),
		outline: JobFileOutlineSchema,
	}),
	z.object({ type: z.literal("batchAssetsReady") }),
	z.object({
		type: z.literal("error"),
		code: z.string(),
		message: z.string(),
	}),
	VideoStreamStartSchema,
	VideoStreamChunkSchema,
	CoverStreamStartSchema,
	CoverStreamChunkSchema,
	z.object({
		type: z.literal("applyJobReady"),
		payload: AppliedJobPayloadSchema,
	}),
]);

export type HostOutboundMessage = z.infer<typeof HostOutboundMessageSchema>;

export type HostOutboundBatch = HostOutboundMessage[];
