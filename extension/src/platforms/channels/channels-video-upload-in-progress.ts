import { findChannelsVideoUploadArea } from "./find-channels-video-upload-area.js";

const CHANNELS_VIDEO_UPLOAD_BUSY_HINTS = [
	"上传中",
	"转码",
	"处理中",
	"文件上传中",
	"请等待完成",
] as const;

function uploadAreaShowsBusyProgress(uploadArea: HTMLElement): boolean {
	const text = uploadArea.textContent ?? "";
	return CHANNELS_VIDEO_UPLOAD_BUSY_HINTS.some((hint) => text.includes(hint));
}

function pageTextContent(root: ParentNode): string {
	if (root instanceof Document) {
		return root.body?.textContent ?? root.documentElement?.textContent ?? "";
	}
	return root.textContent ?? "";
}

/** True while WeChat is still processing the attached video (cover editing is blocked). */
export function channelsVideoUploadInProgress(root: ParentNode): boolean {
	const bodyText = pageTextContent(root);
	if (CHANNELS_VIDEO_UPLOAD_BUSY_HINTS.some((hint) => bodyText.includes(hint))) {
		return true;
	}

	const uploadArea = findChannelsVideoUploadArea(root);
	if (uploadArea && uploadAreaShowsBusyProgress(uploadArea)) return true;

	return false;
}
