export const BATCH_VIDEO_FILE_EXTENSION = ".mp4" as const;

export const BATCH_COVER_FILE_EXTENSIONS = [".png", ".jpg", ".jpeg"] as const;

/** Suffix appended to the cover file stem for the horizontal (4:3) variant. */
export const BATCH_HORIZONTAL_COVER_SUFFIX = "-4x3" as const;


/** Preferred default when deriving a single cover path hint (`.png` first). */
export const BATCH_COVER_FILE_EXTENSION = BATCH_COVER_FILE_EXTENSIONS[0];
