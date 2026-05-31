function escapeRegExpSegment(segment: string): string {
	return segment.replace(/[.+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function patternGlobToRegExp(pattern: string): RegExp {
	const parts = pattern.split("*");
	const escaped = parts.map((part) => escapeRegExpSegment(part));
	return new RegExp(`^${escaped.join(".*")}$`);
}

export function matchUrlAgainstPatterns(url: string, patterns: readonly string[]): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") return false;
		const href = parsed.href;
		return patterns.some((pattern) => patternGlobToRegExp(pattern).test(href));
	} catch {
		return false;
	}
}
