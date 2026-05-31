import { DOUYIN_COVER_DRAG_MAIN_TEXT } from "../platforms/douyin/douyin-cover-selectors.js";
import { normalizeUiText } from "./normalize-ui-text.js";

const DOUYIN_VIDEO_UPLOAD_HINT = "点击上传" as const;

function isSemiCoverDragArea(area: HTMLElement): boolean {
	return (
		area.classList.contains("semi-upload-drag-area") ||
		area.matches('[class*="semi-upload-drag-area"]')
	);
}

export function uploadAreaLooksLikeDouyinCoverModal(area: HTMLElement): boolean {
	const text = normalizeUiText(area.textContent);

	if (isSemiCoverDragArea(area)) {
		if (text.includes(DOUYIN_COVER_DRAG_MAIN_TEXT)) return true;
		return text.includes("点击上传文件") && !text.includes("视频");
	}

	if (text.includes(DOUYIN_VIDEO_UPLOAD_HINT) && text.includes("拖入此区域")) return false;
	if (text.includes("视频文件")) return false;
	return text.includes("封面") || text.includes("上传");
}
