import {
	BATCH_COVER_FILE_EXTENSION,
	BATCH_COVER_FILE_EXTENSIONS,
	BATCH_VIDEO_FILE_EXTENSION,
} from "../constants/batch-assets.js";

export function deriveBatchItemVideoFileName(name: string): string {
	return `${name}${BATCH_VIDEO_FILE_EXTENSION}`;
}

export function deriveBatchItemCoverFileName(name: string): string {
	return `${name}${BATCH_COVER_FILE_EXTENSION}`;
}

export function deriveBatchItemCoverFileNames(name: string): string[] {
	return BATCH_COVER_FILE_EXTENSIONS.map((extension) => `${name}${extension}`);
}
