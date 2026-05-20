export const BILIBILI_TITLE_PLACEHOLDER_HINT = "请输入稿件标题" as const;

export const BILIBILI_DESCRIPTION_PLACEHOLDER_HINT =
	"填写更全面的相关信息，让更多的人能找到你的视频吧" as const;

export const BILIBILI_TAG_PLACEHOLDER_HINT = "按回车键Enter创建标签" as const;

export const BILIBILI_TITLE_SELECTORS = [
	`input[placeholder*="${BILIBILI_TITLE_PLACEHOLDER_HINT}"]`,
	`textarea[placeholder*="${BILIBILI_TITLE_PLACEHOLDER_HINT}"]`,
	`input[data-placeholder*="${BILIBILI_TITLE_PLACEHOLDER_HINT}"]`,
	`textarea[data-placeholder*="${BILIBILI_TITLE_PLACEHOLDER_HINT}"]`,
	"#title",
] as const;

export const BILIBILI_DESCRIPTION_SELECTORS = [
	`textarea[data-placeholder*="${BILIBILI_DESCRIPTION_PLACEHOLDER_HINT}"]`,
	`div[contenteditable="true"][data-placeholder*="${BILIBILI_DESCRIPTION_PLACEHOLDER_HINT}"]`,
	`textarea[placeholder*="${BILIBILI_DESCRIPTION_PLACEHOLDER_HINT}"]`,
	'textarea[placeholder*="简介"]',
	'textarea[placeholder*="描述"]',
	'div[contenteditable="true"][data-placeholder*="简介"]',
] as const;

export const BILIBILI_SOURCE_TYPE_GROUP_SELECTORS = [".type-check-radio-wrp"] as const;

export const BILIBILI_SOURCE_TYPE_OPTION_CLASS = "check-radio-v2-container" as const;

export const BILIBILI_SOURCE_TYPE_LABEL_CLASS = "check-radio-v2-name" as const;

export const BILIBILI_PARTITION_SECTION_HEADING_CLASS = "section-title-content-main" as const;

export const BILIBILI_PARTITION_SELECT_CONTROLLER_CLASS = "select-controller" as const;

export const BILIBILI_PARTITION_SELECT_ITEM_CLASS = "select-item-cont" as const;

export const BILIBILI_PARTITION_SELECT_ITEM_INSERTED_CLASS = "select-item-cont-inserted" as const;

export const BILIBILI_TAG_SELECTORS = [
	`input[placeholder*="${BILIBILI_TAG_PLACEHOLDER_HINT}"]`,
	`input[data-placeholder*="${BILIBILI_TAG_PLACEHOLDER_HINT}"]`,
	'input[placeholder*="标签"]',
	'input[placeholder*="tag" i]',
] as const;

export const BILIBILI_VIDEO_FILE_INPUT_SELECTORS = [
	'input[type="file"][accept*="video"]',
	'input[type="file"][accept*="mp4"]',
] as const;

export const BILIBILI_COVER_EDIT_TEXT = "封面设置" as const;

export const BILIBILI_COVER_UPLOAD_TEXT = "上传封面" as const;

export const BILIBILI_COVER_TRIGGER_SELECTORS = [".cover-img"] as const;

export const BILIBILI_COVER_MODAL_UPLOAD_AREA_SELECTORS = [".upload-area"] as const;

export const BILIBILI_COVER_FILE_INPUT_SELECTORS = [
	'input[type="file"][accept*="image"]',
	'input[type="file"][accept*="png"]',
	'input[type="file"][accept*="jpeg"]',
	'input[type="file"]',
] as const;

export const SEMI_AUTO_BANNER_ID = "auto_upload_semi_auto_banner" as const;
