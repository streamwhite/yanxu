import { z } from "zod";

export const FieldLocatorSchema = z
	.object({
		css: z.string().min(1).optional(),
		id: z.string().min(1).optional(),
		name: z.string().min(1).optional(),
	})
	.superRefine((locator, ctx) => {
		if (locator.css || locator.id || locator.name) return;
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "locator requires css, id, or name",
			path: [],
		});
	});

export type FieldLocator = z.infer<typeof FieldLocatorSchema>;

export const PageFieldSchema = z.object({
	locator: FieldLocatorSchema,
	value: z.string(),
});

export type PageField = z.infer<typeof PageFieldSchema>;
