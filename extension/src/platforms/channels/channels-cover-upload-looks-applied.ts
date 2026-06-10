import { queryAllDeep } from "../../content/query-all-deep.js";
import { CHANNELS_VERTICAL_COVER_WRAP_SELECTOR } from "./channels-cover-selectors.js";

const CHANNELS_AUTO_COVER_SRC_PATTERN = /finder\.video\.qq\.com|stodownload/i;

export function isChannelsAutoVideoFrameCoverImg(img: HTMLImageElement): boolean {
	return CHANNELS_AUTO_COVER_SRC_PATTERN.test(img.src);
}

export function channelsCoverImgLooksUserUploaded(img: HTMLImageElement): boolean {
	if (isChannelsAutoVideoFrameCoverImg(img)) return false;
	return img.src.startsWith("blob:") || img.src.startsWith("data:");
}

function wrapCoverPreviewLooksUserUploaded(wrap: HTMLElement): boolean {
	for (const candidate of Array.from(wrap.querySelectorAll("img"))) {
		if (!(candidate instanceof HTMLImageElement)) continue;
		if (candidate.classList.contains("blur-img")) continue;
		if (candidate.classList.contains("blur-img-bottom")) continue;
		if (channelsCoverImgLooksUserUploaded(candidate)) return true;
	}
	return false;
}

export function channelsCoverDialogLooksApplied(dialog: ParentNode): boolean {
	for (const candidate of Array.from(dialog.querySelectorAll("img"))) {
		if (!(candidate instanceof HTMLImageElement)) continue;
		if (channelsCoverImgLooksUserUploaded(candidate)) return true;
	}
	return false;
}

export function channelsCoverWrapLooksUserUploaded(
	root: ParentNode,
	wrapSelector: string,
): boolean {
	for (const wrap of queryAllDeep(root, wrapSelector)) {
		if (wrapCoverPreviewLooksUserUploaded(wrap)) return true;
	}
	return false;
}

/** @deprecated Prefer channelsCoverWrapLooksUserUploaded; auto video frames must not count as uploaded. */
export function channelsCoverWrapLooksApplied(
	root: ParentNode,
	wrapSelector: string,
): boolean {
	return channelsCoverWrapLooksUserUploaded(root, wrapSelector);
}

export function channelsCoverUploadLooksUserUploaded(root: ParentNode): boolean {
	return channelsCoverWrapLooksUserUploaded(root, CHANNELS_VERTICAL_COVER_WRAP_SELECTOR);
}

export function channelsCoverUploadLooksApplied(root: ParentNode): boolean {
	return channelsCoverUploadLooksUserUploaded(root);
}
