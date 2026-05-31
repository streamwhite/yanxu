export const DOUYIN_COVER_SELECT_TITLE = "选择封面" as const;

export const DOUYIN_COVER_TITLE_SELECTORS = ['div[class*="title-"]'] as const;

export const DOUYIN_COVER_FILTER_SELECTORS = ['div[class*="filter-"]'] as const;

export const DOUYIN_COVER_MODAL_BODY_SELECTOR = "#dy-creator-content-modal-body" as const;

export const DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR = '[class*="semi-upload"]' as const;

export const DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR = ".semi-upload-drag-area" as const;

export const DOUYIN_COVER_SEMI_DRAG_MAIN_TEXT_SELECTOR =
	".semi-upload-drag-area-main-text" as const;

export const DOUYIN_COVER_DRAG_MAIN_TEXT = "点击上传文件或拖拽文件到这里" as const;

export const DOUYIN_COVER_MODAL_UPLOAD_AREA_SELECTORS = [
	DOUYIN_COVER_MODAL_SEMI_UPLOAD_SELECTOR,
	DOUYIN_COVER_SEMI_DRAG_AREA_SELECTOR,
	'[class*="upload-area"]',
	'[class*="container-"][class*="upload-"]',
] as const;

export const DOUYIN_COVER_MODAL_UPLOAD_LIST_SELECTORS = [
	".semi-upload-file-list",
	'[class*="upload-list"]',
	".semi-upload-picture",
] as const;

export const DOUYIN_COVER_MODAL_PREVIEW_SELECTORS = [
	'[class*="preview"]',
	'[class*="picture-card"]',
	'[class*="file-card"]',
	'img[src^="blob:"]',
	'img[src^="data:"]',
] as const;
