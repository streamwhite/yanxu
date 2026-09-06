export const CHANNELS_TITLE_PLACEHOLDER = "概括视频主要内容，字数建议6-16个字符" as const;
export const CHANNELS_DESCRIPTION_PLACEHOLDER = "添加描述" as const;
export const CHANNELS_SHORT_TITLE_PLACEHOLDER = "填写短标题有机会获得更多流量" as const;
export const CHANNELS_ORIGINAL_DECLARE_HINT = "声明后，作品将展示原创标记" as const;

export const CHANNELS_ORIGINAL_DECLARE_FULL_HINT =
	"声明后，作品将展示原创标记，有机会获得广告收入。" as const;

export const CHANNELS_DECLARE_ORIGINAL_CHECKBOX_SELECTOR = ".declare-original-checkbox" as const;
export const CHANNELS_ORIGINAL_PROTO_WRAPPER_SELECTOR = ".original-proto-wrapper" as const;

export const CHANNELS_ORIGINAL_SUBMIT_BUTTON_TEXT = "声明原创" as const;

export const CHANNELS_ORIGINAL_SUBMIT_BUTTON_SELECTORS = [
	"button.weui-desktop-btn.weui-desktop-btn_primary",
	"button.weui-desktop-btn_primary",
] as const;

export const CHANNELS_CONFIRM_BUTTON_HINTS = [
	CHANNELS_ORIGINAL_SUBMIT_BUTTON_TEXT,
	"确定",
	"确认",
	"同意",
] as const;

export const CHANNELS_TITLE_HINT = "标题" as const;
export const CHANNELS_DESCRIPTION_HINT = "描述" as const;
export const CHANNELS_SHORT_TITLE_HINT = "短标题" as const;

export const CHANNELS_TITLE_SELECTORS = [
	`input.weui-desktop-form__input[type="text"][placeholder="${CHANNELS_TITLE_PLACEHOLDER}"]`,
	`input[type="text"][placeholder="${CHANNELS_TITLE_PLACEHOLDER}"]`,
	`input[placeholder*="${CHANNELS_TITLE_HINT}"]`,
	`textarea[placeholder*="${CHANNELS_TITLE_HINT}"]`,
] as const;

export const CHANNELS_DESCRIPTION_SELECTORS = [
	`.post-desc-box div.input-editor[data-placeholder="${CHANNELS_DESCRIPTION_PLACEHOLDER}"]`,
	`div.post-desc-box div.input-editor[contenteditable]`,
	`div.input-editor[contenteditable][data-placeholder="${CHANNELS_DESCRIPTION_PLACEHOLDER}"]`,
	`div.input-editor[data-placeholder="${CHANNELS_DESCRIPTION_PLACEHOLDER}"]`,
	`div[contenteditable][data-placeholder="${CHANNELS_DESCRIPTION_PLACEHOLDER}"]`,
	`textarea[placeholder*="${CHANNELS_DESCRIPTION_HINT}"]`,
	`div[contenteditable="true"][data-placeholder*="${CHANNELS_DESCRIPTION_HINT}"]`,
	`textarea[placeholder*="简介"]`,
	`div[contenteditable="true"][data-placeholder*="简介"]`,
] as const;

export const CHANNELS_SHORT_TITLE_SELECTORS = [
	`.short-title-wrap input.weui-desktop-form__input[placeholder="${CHANNELS_SHORT_TITLE_PLACEHOLDER}"]`,
	`input.weui-desktop-form__input[placeholder="${CHANNELS_SHORT_TITLE_PLACEHOLDER}"]`,
	`.post-short-title-wrap input[type="text"]`,
	`input[placeholder*="${CHANNELS_SHORT_TITLE_HINT}"]`,
] as const;

export const CHANNELS_ORIGINAL_DECLARE_LABEL_SELECTOR = "label.ant-checkbox-wrapper" as const;

export const CHANNELS_MARK_TAG_LABEL_HINT = "视频标注" as const;

export const CHANNELS_MARK_TAG_WRAPPER_SELECTOR = ".post-with-mark-tag" as const;

export const CHANNELS_MARK_TAG_SELECT_SELECTOR = ".mark-tag-select" as const;

export const CHANNELS_MARK_TAG_DISPLAY_SELECTOR = ".select-display" as const;

export const CHANNELS_MARK_TAG_PLACEHOLDER_CLASS = "select-placeholder" as const;

export const CHANNELS_MARK_TAG_OPTIONS_SELECTOR = ".mark-tag-options" as const;

export const CHANNELS_MARK_TAG_OPTION_SELECTOR = ".mark-tag-option" as const;

export const CHANNELS_MARK_TAG_OPTION_MAIN_CLASS = "option-main" as const;

export const CHANNELS_MARK_TAG_SELECT_SELECTORS = [
	`${CHANNELS_MARK_TAG_WRAPPER_SELECTOR} ${CHANNELS_MARK_TAG_SELECT_SELECTOR}`,
	CHANNELS_MARK_TAG_SELECT_SELECTOR,
] as const;

export const CHANNELS_VIDEO_UPLOAD_TIP_TEXT_HINT = "MP4/H.264" as const;

export const CHANNELS_VIDEO_UPLOAD_DURATION_HINT = "上传时长8小时内" as const;

export const CHANNELS_VIDEO_UPLOAD_AREA_SELECTORS = [".upload-content"] as const;

export const CHANNELS_VIDEO_FILE_INPUT_SELECTORS = [
	'input[type="file"][accept*="video"]',
	'input[type="file"][accept*="mp4"]',
	'input[type="file"]',
] as const;
