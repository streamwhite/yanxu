import { normalizeUiText } from "./normalize-ui-text.js";

export function uploadAreaLooksLikeChannelsCoverModal(area: HTMLElement): boolean {
	const text = normalizeUiText(area.textContent);
	if (text.includes("MP4/H.264")) return false;
	if (text.includes("上传时长")) return false;
	return text.includes("封面") || text.includes("上传") || text.includes("图片");
}
