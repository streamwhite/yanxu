const BASE64_WHITESPACE_PATTERN = /\s/g;

const BASE64_URL_DASH = /-/g;
const BASE64_URL_UNDERSCORE = /_/g;

const BASE64_PAD_CHAR = "=";

export function sanitizeBase64ForAtob(base64: string): string {
	const withoutWhitespace = base64.replace(BASE64_WHITESPACE_PATTERN, "");
	const standard = withoutWhitespace
		.replace(BASE64_URL_DASH, "+")
		.replace(BASE64_URL_UNDERSCORE, "/");
	const remainder = standard.length % 4;
	if (remainder === 0) return standard;
	return standard + BASE64_PAD_CHAR.repeat(4 - remainder);
}
