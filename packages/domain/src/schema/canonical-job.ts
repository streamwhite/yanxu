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
import { Platform, PLATFORM_IDS } from "../constants/platform";
import { BilibiliSourceType } from "../constants/bilibili-source-type";
import { BasicTextFieldsSchema } from "./basic-text-fields";
import { ChannelsTargetSchema } from "./channels-target";
import { PageFieldSchema } from "./field-locator";
import { jobHasDefaultTitle } from "../job/job-has-default-title.js";
import { PublishMode, PublishSchema, SubmitPolicy } from "./publish.js";

export { PublishMode, SubmitPolicy };
export type { PublishMode as PublishModeType, SubmitPolicy as SubmitPolicyType };

const PathString = z
	.string()
	.min(1, "Path must be non-empty")
	.max(MAX_PATH_LENGTH, `Path must be at most ${String(MAX_PATH_LENGTH)} characters`);

const Tags = z
	.array(z.string().max(MAX_TAG_LENGTH))
	.max(MAX_TAG_COUNT, `At most ${String(MAX_TAG_COUNT)} tags`)
	.optional();

const PlatformIdSchema = z.enum(PLATFORM_IDS);

const BilibiliCreativeStatementFields = {
	creativeStatement: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
	creativeStatementAuth: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
} as const;

const BilibiliTarget = z.object({
	title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
	description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH).optional(),
	tags: Tags,
	sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
	partition: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
	...BilibiliCreativeStatementFields,
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

const JobBaseFields = z.object({
	publish: PublishSchema,
	assets: Assets,
	policy: Policy,
	pageFields: z.array(PageFieldSchema).optional(),
});

const CanonicalJobV1Schema = JobBaseFields.extend({
	jobVersion: z.literal(1),
	platform: z.literal(Platform.Bilibili),
	targets: z.array(z.literal(Platform.Bilibili)).min(1),
	bilibili: z.object({
		title: z.string().min(1).max(MAX_TITLE_LENGTH),
		description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH),
		tags: Tags,
		sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
		partition: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
		...BilibiliCreativeStatementFields,
	}),
});

const CanonicalJobV2Schema = JobBaseFields.extend({
	jobVersion: z.literal(2),
	platform: PlatformIdSchema,
	targets: z.array(PlatformIdSchema).min(1),
	bilibili: BilibiliTarget.optional(),
	douyin: BasicTextFieldsSchema.optional(),
	channels: ChannelsTargetSchema.optional(),
});

export const CanonicalJobSchema = z
	.union([CanonicalJobV1Schema, CanonicalJobV2Schema])
	.superRefine((job, ctx) => {
		if (job.jobVersion !== 2) return;

		const primaryTarget = job.targets[0];
		if (primaryTarget !== job.platform) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "targets[0] must match platform",
				path: ["targets"],
			});
		}

		const hasPageFields = (job.pageFields?.length ?? 0) > 0;
		if (!hasPageFields && !jobHasDefaultTitle(job)) {
			const titlePath =
				job.platform === Platform.Bilibili
					? "bilibili.title"
					: job.platform === Platform.Douyin
						? "douyin.title"
						: "channels.title";
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `provide ${titlePath} or at least one pageFields entry`,
				path: ["pageFields"],
			});
		}
	});

export type CanonicalJob = z.infer<typeof CanonicalJobSchema>;

export const DEFAULT_JOB_POLICY = {
	maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
	maxCoverInlineBytes: DEFAULT_MAX_COVER_INLINE_BYTES,
} as const;
