export function looksLikeBatchJobFile(input: unknown): boolean {
	if (!input || typeof input !== "object" || Array.isArray(input)) return false;

	const candidate = input as Record<string, unknown>;
	if (candidate.jobVersion === 3) return true;
	if ("assetsParentFolder" in candidate) return true;
	return Array.isArray(candidate.items);
}
