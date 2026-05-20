export const MAX_TITLE_LENGTH = 200 as const;

export const MAX_PARTITION_LENGTH = 64 as const;

export const MAX_DESCRIPTION_LENGTH = 20_000 as const;

export const MAX_TAG_COUNT = 20 as const;

export const MAX_TAG_LENGTH = 32 as const;

export const MAX_PATH_LENGTH = 4096 as const;

export const BYTES_PER_KIB = 1024 as const;

export const BYTES_PER_MIB = BYTES_PER_KIB * BYTES_PER_KIB;

export const DEFAULT_MAX_DIRECT_ATTACH_BYTES = 1024 * BYTES_PER_MIB;

export const DEFAULT_MAX_COVER_INLINE_BYTES = 8 * BYTES_PER_MIB;

export const DEFAULT_TRANSFER_CHUNK_BYTES = 256 * BYTES_PER_KIB;

/** Max raw video bytes eligible for single-frame base64 over Chrome native messaging (~1 MiB cap). */
export const MAX_NATIVE_INLINE_VIDEO_BYTES = 400 * BYTES_PER_KIB;

/** Max raw cover bytes eligible for single-frame base64 over Chrome native messaging (~1 MiB cap). */
export const MAX_NATIVE_INLINE_COVER_BYTES = 400 * BYTES_PER_KIB;
