import {
	VIDEO_FILE_INPUT_WAIT_MS,
	VIDEO_UPLOAD_TRIGGER_SETTLE_MS,
} from "../../content/constants/video-upload-timing.js";

export const BILIBILI_VIDEO_UPLOAD_SETTLE_MS = VIDEO_UPLOAD_TRIGGER_SETTLE_MS;

export const DOUYIN_VIDEO_UPLOAD_SETTLE_MS = VIDEO_UPLOAD_TRIGGER_SETTLE_MS;

export const CHANNELS_VIDEO_UPLOAD_SETTLE_MS = 600 as const;

export const CHANNELS_VIDEO_FILE_INPUT_WAIT_MS = VIDEO_FILE_INPUT_WAIT_MS * 3;

export const CHANNELS_VIDEO_UPLOAD_SETTLE_AFTER_START_MS = 2_500 as const;

export const CHANNELS_VIDEO_UPLOAD_SETTLE_WAIT_MS = 20_000 as const;

/** Wait for server-side video processing before cover upload (large files can take minutes). */
export const CHANNELS_VIDEO_UPLOAD_COMPLETE_WAIT_MS = 600_000 as const;

export const CHANNELS_VIDEO_UPLOAD_RETRY_MS = 500 as const;

export const CHANNELS_VIDEO_UPLOAD_MAX_ATTEMPTS = 3 as const;

export const CHANNELS_ACTIVATE_TAB_SETTLE_MS = 2_500 as const;

/** Re-focus the 视频号 tab while a long apply runs in the content script. */
export const CHANNELS_KEEP_TAB_ACTIVE_INTERVAL_MS = 2_000 as const;

export const CHANNELS_FIELDS_READY_WAIT_MS = 20_000 as const;

export const CHANNELS_PAGE_INTERACTIVE_WAIT_MS = 25_000 as const;

/** Wait for the Channels tab to be foreground before assigning video (drag/drop needs a visible page). */
export const CHANNELS_DOCUMENT_VISIBLE_WAIT_MS = 15_000 as const;

export const BILIBILI_ACTIVATE_TAB_SETTLE_MS = 600 as const;

export const DOUYIN_ACTIVATE_TAB_SETTLE_MS = 600 as const;

export const CHANNELS_TAB_OPEN_SETTLE_MS = 1_500 as const;

export const CHANNELS_TAB_OPEN_RELOAD_SETTLE_MS = 2_500 as const;

export const BILIBILI_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS = 2_000 as const;

export const CHANNELS_FULL_PHASE_VIDEO_TO_FIELDS_SETTLE_MS = 1_500 as const;
