export const CHANNELS_COVER_EDIT_TEXT = "编辑" as const;

export const CHANNELS_VERTICAL_COVER_WRAP_SELECTOR = ".vertical-cover-wrap" as const;

export const CHANNELS_HORIZON_COVER_WRAP_SELECTOR = ".horizon-cover-wrap" as const;

export const CHANNELS_COVER_EDIT_BTN_SELECTOR = ".edit-btn" as const;

/** Commits vertical cover upload and closes that popover. */
export const CHANNELS_COVER_VERTICAL_CONFIRM_TEXT = "确认" as const;

export const CHANNELS_COVER_VERTICAL_CONFIRM_BTN_WRAP_SELECTOR =
	".weui-desktop-btn_wrp:not(.btn-use)" as const;

export const CHANNELS_COVER_USE_MATERIAL_TEXT = "使用素材" as const;

export const CHANNELS_COVER_USE_MATERIAL_BTN_WRAP_SELECTOR =
	".weui-desktop-btn_wrp.btn-use" as const;

export const CHANNELS_COVER_USE_MATERIAL_BTN_SELECTOR =
	"button.weui-desktop-btn_primary.weui-desktop-btn_mini" as const;

/** Generic popover dismiss fallback (not for vertical commit). */
export const CHANNELS_COVER_DIALOG_CONFIRM_HINTS = ["完成", "确定"] as const;

export const CHANNELS_COVER_POPOVER_CLOSE_SELECTORS = [
	".weui-desktop-popover__close",
	".weui-desktop-dialog__close-btn",
	'[class*="popover__close"]',
] as const;

export const CHANNELS_COVER_POPOVER_SELECTORS = [
	".weui-desktop-dialog",
	".weui-desktop-popover__wrp",
	".weui-desktop-popover",
	'[class*="popover"]',
] as const;

export const CHANNELS_COVER_DIALOG_HOST_SELECTORS = [
	".weui-desktop-dialog",
	".weui-desktop-popover__wrp",
	".weui-desktop-popover",
	".ant-modal",
] as const;

export const CHANNELS_COVER_UPLOAD_CLICK_SELECTORS = [
	".weui-desktop-upload",
	'[class*="upload-area"]',
	'[class*="upload-content"]',
	".weui-desktop-upload__input",
] as const;
