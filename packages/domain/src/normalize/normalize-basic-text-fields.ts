import type { BasicTextFields } from "../schema/basic-text-fields";
import { sanitizeText } from "../text/sanitize-text";

export function normalizeBasicTextFields(fields: BasicTextFields): BasicTextFields {
	return {
		...fields,
		...(fields.title === undefined ? {} : { title: sanitizeText(fields.title) }),
		...(fields.description === undefined ? {} : { description: sanitizeText(fields.description) }),
	};
}
