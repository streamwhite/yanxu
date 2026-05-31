import { z } from "zod";

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

export const PublishSchema = z
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

export const DEFAULT_BATCH_PUBLISH = {
	mode: PublishMode.Semi,
	submit: SubmitPolicy.Manual,
} as const;
