import { z } from "zod";
import { BilibiliSourceType } from "../constants/bilibili-source-type";
import { MAX_PARTITION_LENGTH, MAX_TITLE_LENGTH } from "../constants/limits";
import { BasicTextFieldsSchema } from "./basic-text-fields";

export const ChannelsTargetSchema = BasicTextFieldsSchema.extend({
	shortTitle: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
	sourceType: z.enum([BilibiliSourceType.Original, BilibiliSourceType.Repost]).optional(),
	markTag: z.string().min(1).max(MAX_PARTITION_LENGTH).optional(),
});

export type ChannelsTarget = z.infer<typeof ChannelsTargetSchema>;
