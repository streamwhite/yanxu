import { z } from "zod";
import { PLATFORM_IDS } from "../constants/platform";

const PlatformIdSchema = z.enum(PLATFORM_IDS);

export const BatchApplyContextSchema = z.object({
	itemIndex: z.number().int().nonnegative(),
	targetPlatform: PlatformIdSchema,
});

export type BatchApplyContext = z.infer<typeof BatchApplyContextSchema>;
