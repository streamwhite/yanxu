export const CHANNELS_COVER_EDIT_TEXT = "编辑" as const;

export const CHANNELS_VERTICAL_COVER_WRAP_SELECTOR = ".vertical-cover-wrap" as const;

export const CHANNELS_HORIZON_COVER_WRAP_SELECTOR = ".horizon-cover-wrap" as const;

export const CHANNELS_COVER_EDIT_BTN_SELECTOR = ".edit-btn" as const;

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
