import { z } from "zod";
import {
	DEFAULT_MAX_COVER_INLINE_BYTES,
	DEFAULT_MAX_DIRECT_ATTACH_BYTES,
	MAX_DESCRIPTION_LENGTH,
	MAX_PATH_LENGTH,
	MAX_TAG_COUNT,
	MAX_TAG_LENGTH,
	MAX_PARTITION_LENGTH,
	MAX_TITLE_LENGTH,
} from "../constants/limits";
import { BilibiliSourceType } from "../constants/bilibili-source-type";
import { PageFieldSchema } from "./field-locator";

export const PublishMode = {
	Semi: "semi",
	Full: "full",
} as const;

export type PublishMode = (typeof PublishMode)[keyof typeof PublishMode];

export const SubmitPolicy = {
	Manual: "manual",
	Programmatic: "programmatic",
} as const;

export type SubmitPolicy = (typeof SubmitPolicy)[keyof typeof SubmitPolicy];

const PathString = z
	.string()
	.min(1, "Path must be non-empty")
	.max(MAX_PATH_LENGTH, `Path must be at most ${String(MAX_PATH_LENGTH)} characters`);

const Tags = z
	.array(z.string().min(1).max(MAX_TAG_LENGTH))
	.max(MAX_TAG_COUNT, `At most ${String(MAX_TAG_COUNT)} tags`)
	.optional();

const Publish = z
	.object({
		mode: z.enum([PublishMode.Semi, PublishMode.Full]),
		submit: z.enum([SubmitPolicy.Manual, SubmitPolicy.Programmatic]),
	})
	.superRefine((value, ctx) => {
		if (value.mode === PublishMode.Semi && value.submit !== SubmitPolicy.Manual) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Semi mode requires manual submit",
				path: ["submit"],
			});
		}
	});

const BilibiliTarget = z.object({
	title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
	description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH).optional(),
	tags: Tags,
	sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
	partition: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
});

const Assets = z.object({
	localVideoPath: PathString,
	localCoverPath: PathString.optional(),
});

const Policy = z
	.object({
		maxDirectAttachBytes: z.number().int().positive().optional(),
		maxCoverInlineBytes: z.number().int().positive().optional(),
		transferChunkBytes: z.number().int().positive().optional(),
	})
	.optional();

const JobBase = z.object({
	platform: z.literal("bilibili"),
	targets: z.array(z.literal("bilibili")).min(1),
	publish: Publish,
	assets: Assets,
	policy: Policy,
	pageFields: z.array(PageFieldSchema).optional(),
});

const CanonicalJobV1Schema = JobBase.extend({
	jobVersion: z.literal(1),
	bilibili: z.object({
		title: z.string().min(1).max(MAX_TITLE_LENGTH),
		description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH),
		tags: Tags,
		sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
		partition: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
	}),
});

const CanonicalJobV2Schema = JobBase.extend({
	jobVersion: z.literal(2),
	bilibili: BilibiliTarget.optional(),
});

export const CanonicalJobSchema = z
	.union([CanonicalJobV1Schema, CanonicalJobV2Schema])
	.superRefine((job, ctx) => {
		if (job.jobVersion !== 2) return;
		const hasPageFields = (job.pageFields?.length ?? 0) > 0;
		const hasBilibiliTitle = Boolean(job.bilibili?.title?.trim());
		if (!hasPageFields && !hasBilibiliTitle) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "provide bilibili.title or at least one pageFields entry",
				path: ["pageFields"],
			});
		}
	});

export type CanonicalJob = z.infer<typeof CanonicalJobSchema>;

export const DEFAULT_JOB_POLICY = {
	maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
	maxCoverInlineBytes: DEFAULT_MAX_COVER_INLINE_BYTES,
} as const;
