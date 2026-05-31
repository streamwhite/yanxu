import { blurActiveElement } from "./blur-active-element.js";

/** Blur focused inputs without sending Escape (Escape closes 视频号 cover modals). */
export function blurActiveFieldBeforeCover(): void {
	blurActiveElement();
}
