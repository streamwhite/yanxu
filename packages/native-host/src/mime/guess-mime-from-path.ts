const VIDEO_EXT_TO_MIME: Readonly<Record<string, string>> = {
	".mp4": "video/mp4",
	".mov": "video/quicktime",
	".mkv": "video/x-matroska",
	".webm": "video/webm",
	".avi": "video/x-msvideo",
} as const;

const IMAGE_EXT_TO_MIME: Readonly<Record<string, string>> = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
} as const;

const FALLBACK_VIDEO_MIME = "application/octet-stream" as const;
const FALLBACK_IMAGE_MIME = "application/octet-stream" as const;

export function guessVideoMimeFromPath(absPath: string): string {
	const lower = absPath.toLowerCase();
	for (const [ext, mime] of Object.entries(VIDEO_EXT_TO_MIME)) {
		if (lower.endsWith(ext)) return mime;
	}
	return FALLBACK_VIDEO_MIME;
}

export function guessImageMimeFromPath(absPath: string): string {
	const lower = absPath.toLowerCase();
	for (const [ext, mime] of Object.entries(IMAGE_EXT_TO_MIME)) {
		if (lower.endsWith(ext)) return mime;
	}
	return FALLBACK_IMAGE_MIME;
}
