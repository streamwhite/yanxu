import { BYTES_PER_MIB } from "@yanxu/domain";

/** Chrome `tabs.sendMessage` maximum serialized message size. */
export const TAB_MESSAGE_MAX_BYTES = 64 * BYTES_PER_MIB;

/** Leave headroom for JSON framing and future fields. */
export const TAB_MESSAGE_SAFE_BYTES = Math.floor(TAB_MESSAGE_MAX_BYTES * 0.9);
