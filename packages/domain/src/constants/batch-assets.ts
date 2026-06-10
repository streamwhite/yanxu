export const BATCH_VIDEO_FILE_EXTENSION = ".mp4" as const;

export const BATCH_COVER_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg"] as const;

/** Preferred default when deriving a single cover path hint (`.png` first). */
export const BATCH_COVER_FILE_EXTENSION = BATCH_COVER_FILE_EXTENSIONS[0];
