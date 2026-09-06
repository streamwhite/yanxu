export const CHANNELS_TITLE_DOT_REPLACEMENT = "点" as const;

const DOT_CHAR = "." as const;

export function normalizeChannelsTitle(title: string): string {
	return title.replaceAll(DOT_CHAR, CHANNELS_TITLE_DOT_REPLACEMENT);
}
