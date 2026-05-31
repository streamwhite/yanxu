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
import { DEFAULT_BATCH_ITEM_TARGETS } from "../constants/default-batch-targets";
import { PLATFORM_IDS } from "../constants/platform";
import { BilibiliSourceType } from "../constants/bilibili-source-type";
import { PageFieldSchema } from "./field-locator";
import { DEFAULT_BATCH_PUBLISH, PublishSchema } from "./publish.js";

const PATH_SEPARATOR_PATTERN = /[/\\]/;

const ParentFolderPath = z
	.string()
	.min(1)
	.max(MAX_PATH_LENGTH, `Path must be at most ${String(MAX_PATH_LENGTH)} characters`);

const ItemName = z
	.string()
	.min(1)
	.max(MAX_TITLE_LENGTH)
	.refine((name) => !PATH_SEPARATOR_PATTERN.test(name), {
		message: "name must not contain path separators",
	});

const Tags = z
	.array(z.string().min(1).max(MAX_TAG_LENGTH))
	.max(MAX_TAG_COUNT, `At most ${String(MAX_TAG_COUNT)} tags`)
	.optional();

const PlatformIdSchema = z.enum(PLATFORM_IDS);

const Policy = z
	.object({
		maxDirectAttachBytes: z.number().int().positive().optional(),
		maxCoverInlineBytes: z.number().int().positive().optional(),
		transferChunkBytes: z.number().int().positive().optional(),
	})
	.optional();

function batchItemHasFillableTitle(item: { name?: string; pageFields?: unknown[] }): boolean {
	if ((item.pageFields?.length ?? 0) > 0) return true;
	return Boolean(item.name?.trim());
}

export const BatchJobItemSchema = z
	.object({
		targets: z.array(PlatformIdSchema).min(1).optional(),
		name: ItemName,
		includeCover: z.boolean().optional(),
		description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH).optional(),
		tags: Tags,
		sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
		partition: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
		creativeStatement: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
		creativeStatementAuth: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
		pageFields: z.array(PageFieldSchema).optional(),
	})
	.superRefine((item, ctx) => {
		if (batchItemHasFillableTitle(item)) return;
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "provide name or at least one pageFields entry",
			path: ["name"],
		});
	})
	.transform((item) => ({
		...item,
		targets: item.targets ?? [...DEFAULT_BATCH_ITEM_TARGETS],
	}));

export const BatchJobSchema = z.object({
	jobVersion: z.literal(3),
	assetsParentFolder: ParentFolderPath,
	publish: PublishSchema.default(DEFAULT_BATCH_PUBLISH),
	policy: Policy,
	items: z.array(BatchJobItemSchema).min(1),
});

export type BatchJob = z.infer<typeof BatchJobSchema>;
export type BatchJobItem = z.infer<typeof BatchJobItemSchema>;

export const DEFAULT_BATCH_JOB_POLICY = {
	maxDirectAttachBytes: DEFAULT_MAX_DIRECT_ATTACH_BYTES,
	maxCoverInlineBytes: DEFAULT_MAX_COVER_INLINE_BYTES,
} as const;
