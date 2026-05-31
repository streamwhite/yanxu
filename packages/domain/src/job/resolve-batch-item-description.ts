import { sanitizeText } from "../text/sanitize-text.js";

export function resolveBatchItemDescription(item: {
	name: string;
	description?: string;
}): string {
	const description =
		item.description === undefined ? "" : sanitizeText(item.description);
	if (description.length > 0) return description;
	return sanitizeText(item.name);
}
