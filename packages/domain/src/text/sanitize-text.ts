const LINE_ENDING_PATTERN = /\r\n/g;

export function sanitizeText(value: string): string {
	const trimmed = value.trim();
	return trimmed.replace(LINE_ENDING_PATTERN, "\n");
}
