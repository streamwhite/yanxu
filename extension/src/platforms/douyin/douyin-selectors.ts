export const DOUYIN_TITLE_PLACEHOLDER = "填写作品标题，为作品获得更多流量" as const;
export const DOUYIN_DESCRIPTION_PLACEHOLDER = "添加作品简介" as const;
export const DOUYIN_UPLOAD_INPUT_NAME = "upload-btn" as const;
export const DOUYIN_UPLOAD_CARD_TEXT_HINT = "点击上传" as const;

export const DOUYIN_TITLE_HINT = "标题" as const;
export const DOUYIN_DESCRIPTION_HINT = "简介" as const;

export const DOUYIN_VIDEO_FILE_INPUT_SELECTORS = [
	`input[type="file"][name="${DOUYIN_UPLOAD_INPUT_NAME}"]`,
	'input[type="file"][class*="upload-btn-input"]',
	'input[type="file"][accept*="video/mp4"]',
	'input[type="file"][accept*="video"]',
	'input[type="file"][accept*="mp4"]',
	'input[type="file"]',
] as const;

export const DOUYIN_UPLOAD_AREA_SELECTORS = [
	'[class*="upload-card"]',
	'[class*="upload-btn"]',
] as const;

export const DOUYIN_TITLE_SELECTORS = [
	`input.semi-input[type="text"][placeholder="${DOUYIN_TITLE_PLACEHOLDER}"]`,
	`input[type="text"][placeholder="${DOUYIN_TITLE_PLACEHOLDER}"]`,
	'input.semi-input.semi-input-default[type="text"][placeholder*="作品标题"]',
	`input[placeholder*="${DOUYIN_TITLE_HINT}"]`,
	`textarea[placeholder*="${DOUYIN_TITLE_HINT}"]`,
	`input[data-placeholder*="${DOUYIN_TITLE_HINT}"]`,
	`textarea[data-placeholder*="${DOUYIN_TITLE_HINT}"]`,
	'input[placeholder*="作品标题"]',
	'input[placeholder*="视频标题"]',
] as const;

export const DOUYIN_DESCRIPTION_SELECTORS = [
	`div[contenteditable="true"][data-placeholder="${DOUYIN_DESCRIPTION_PLACEHOLDER}"]`,
	'div.editor-comp-publish[contenteditable="true"]',
	`div[contenteditable="true"][data-placeholder*="${DOUYIN_DESCRIPTION_PLACEHOLDER}"]`,
	`textarea[placeholder*="${DOUYIN_DESCRIPTION_HINT}"]`,
	`div[contenteditable="true"][data-placeholder*="${DOUYIN_DESCRIPTION_HINT}"]`,
	`textarea[placeholder*="描述"]`,
	`div[contenteditable="true"][data-placeholder*="描述"]`,
] as const;
