import { sanitizeText } from "../text/sanitize-text.js";

export function resolveBatchItemDescription(item: {
	name: string;
	description?: string;
}): string {
	if (item.description === undefined) return sanitizeText(item.name);
	return sanitizeText(item.description);
}
