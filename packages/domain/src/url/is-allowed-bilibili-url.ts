import { BILIBILI_CONTENT_SCRIPT_MATCHES } from "../constants/bilibili";

function escapeRegExpSegment(segment: string): string {
	return segment.replace(/[.+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function extendPatternGlobToRegExp(pattern: string): RegExp {
	const parts = pattern.split("*");
	const escaped = parts.map((part) => escapeRegExpSegment(part));
	return new RegExp(`^${escaped.join(".*")}$`);
}

export function isAllowedBilibiliMatchUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") return false;
		const href = parsed.href;
		return BILIBILI_CONTENT_SCRIPT_MATCHES.some((pattern) =>
			extendPatternGlobToRegExp(pattern).test(href),
		);
	} catch {
		return false;
	}
}
