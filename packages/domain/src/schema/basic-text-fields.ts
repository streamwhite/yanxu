import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "../constants/limits";

export const BasicTextFieldsSchema = z.object({
	title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
	description: z.string().min(0).max(MAX_DESCRIPTION_LENGTH).optional(),
});

export type BasicTextFields = z.infer<typeof BasicTextFieldsSchema>;
