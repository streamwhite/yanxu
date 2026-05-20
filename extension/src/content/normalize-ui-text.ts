export function normalizeUiText(text: string | null | undefined): string {
	return (text ?? "").trim().replace(/\s+/g, " ");
}
