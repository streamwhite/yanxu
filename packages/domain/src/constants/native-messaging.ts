import { BYTES_PER_KIB, BYTES_PER_MIB } from "./limits";

export const NATIVE_HOST_NAME = "com.auto_upload.upload_host" as const;

export const NATIVE_MESSAGE_HEADER_LENGTH_BYTES = 4 as const;

export const NATIVE_MESSAGE_MAX_BYTES = BYTES_PER_MIB;

export const NATIVE_MESSAGE_CHUNK_READ_SIZE = 64 * BYTES_PER_KIB;
