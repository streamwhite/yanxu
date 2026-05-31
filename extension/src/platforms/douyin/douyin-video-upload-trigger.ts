import { dispatchClick } from "../../content/dispatch-click.js";
import { findClickableByTextHint } from "../../content/find-clickable-by-text-hint.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import { findDouyinVideoUploadArea } from "./find-douyin-video-upload-area.js";
import { DOUYIN_UPLOAD_AREA_SELECTORS, DOUYIN_UPLOAD_CARD_TEXT_HINT } from "./douyin-selectors.js";

export const DOUYIN_VIDEO_UPLOAD_TRIGGER_TEXT_HINTS = [
	DOUYIN_UPLOAD_CARD_TEXT_HINT,
	"上传视频",
	"上传作品",
] as const;

export function clickDouyinVideoUploadTrigger(root: ParentNode): HTMLElement | null {
	const uploadArea = findDouyinVideoUploadArea(root);
	if (uploadArea) {
		const clickable = findClickableByTextHint(uploadArea, DOUYIN_UPLOAD_CARD_TEXT_HINT);
		if (clickable) {
			dispatchClick(clickable);
			return uploadArea;
		}

		dispatchClick(uploadArea);
		return uploadArea;
	}

	for (const hint of DOUYIN_VIDEO_UPLOAD_TRIGGER_TEXT_HINTS) {
		const clickable = findClickableByTextHint(root, hint);
		if (clickable) {
			dispatchClick(clickable);
			return clickable;
		}
	}

	for (const selector of DOUYIN_UPLOAD_AREA_SELECTORS) {
		const target = queryAllDeep(root, selector)[0];
		if (target) {
			dispatchClick(target);
			return target;
		}
	}

	return null;
}
