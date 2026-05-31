import { findVideoFileInput } from "../../content/find-video-file-input.js";
import { DOUYIN_VIDEO_FILE_INPUT_SELECTORS } from "./douyin-selectors.js";

export function findDouyinVideoFileInput(root: ParentNode): HTMLInputElement | null {
	return findVideoFileInput(root, DOUYIN_VIDEO_FILE_INPUT_SELECTORS);
}
