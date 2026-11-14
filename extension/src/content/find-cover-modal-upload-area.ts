import { Platform, type PlatformId } from "@yanxu/domain";
import { findDouyinCoverDragArea } from "../platforms/douyin/find-douyin-cover-drag-area.js";
import { DOUYIN_COVER_MODAL_UPLOAD_AREA_SELECTORS } from "../platforms/douyin/douyin-cover-selectors.js";
import { uploadAreaLooksLikeChannelsCoverModal } from "./upload-area-looks-like-channels-cover-modal.js";
import { uploadAreaLooksLikeCoverModal } from "./upload-area-looks-like-cover-modal.js";
import { uploadAreaLooksLikeDouyinCoverModal } from "./upload-area-looks-like-douyin-cover-modal.js";
import { isElementVisible } from "./is-element-visible.js";
import { queryAllDeep } from "./query-all-deep.js";

function findBilibiliCoverModalUploadArea(root: ParentNode): HTMLElement | null {
	const candidates = Array.from(root.querySelectorAll(".upload-area"));

	for (const candidate of candidates) {
		if (!(candidate instanceof HTMLElement)) continue;
		if (!isElementVisible(candidate)) continue;
		if (!uploadAreaLooksLikeCoverModal(candidate)) continue;
		return candidate;
	}

	return null;
}

function matchesUploadAreaHeuristic(area: HTMLElement, platform: PlatformId): boolean {
	if (platform === Platform.Douyin) return uploadAreaLooksLikeDouyinCoverModal(area);
	if (platform === Platform.Channels) return uploadAreaLooksLikeChannelsCoverModal(area);
	return false;
}

function findCoverModalUploadAreaBySelectors(
	root: ParentNode,
	selectors: readonly string[],
	platform: PlatformId,
): HTMLElement | null {
	for (const selector of selectors) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (!(candidate instanceof HTMLElement)) continue;
			if (!isElementVisible(candidate)) continue;
			if (!matchesUploadAreaHeuristic(candidate, platform)) continue;
			return candidate;
		}
	}
	return null;
}

function findDouyinCoverModalUploadArea(root: ParentNode): HTMLElement | null {
	const semiDrag = findDouyinCoverDragArea(root);
	if (semiDrag) return semiDrag;

	const byClass = findBilibiliCoverModalUploadArea(root);
	if (byClass) return byClass;
	return findCoverModalUploadAreaBySelectors(
		root,
		DOUYIN_COVER_MODAL_UPLOAD_AREA_SELECTORS,
		Platform.Douyin,
	);
}

function findChannelsCoverModalUploadArea(root: ParentNode): HTMLElement | null {
	const byClass = findBilibiliCoverModalUploadArea(root);
	if (byClass) return byClass;
	return findCoverModalUploadAreaBySelectors(
		root,
		['[class*="upload-area"]', '[class*="upload-content"]', ".weui-desktop-upload"],
		Platform.Channels,
	);
}

export function findCoverModalUploadArea(
	root: ParentNode,
	platform: PlatformId,
): HTMLElement | null {
	if (platform === Platform.Bilibili) return findBilibiliCoverModalUploadArea(root);
	if (platform === Platform.Douyin) return findDouyinCoverModalUploadArea(root);
	if (platform === Platform.Channels) return findChannelsCoverModalUploadArea(root);
	return null;
}
