import { pickFirstVisibleElementDeep } from "../../content/dom.js";
import { queryAllDeep } from "../../content/query-all-deep.js";
import {
	CHANNELS_DESCRIPTION_SELECTORS,
	CHANNELS_SHORT_TITLE_SELECTORS,
	CHANNELS_TITLE_SELECTORS,
} from "./channels-selectors.js";

function pickFirstConnectedField(
	root: ParentNode,
	selectors: readonly string[],
): HTMLElement | null {
	const visible = pickFirstVisibleElementDeep(root, selectors);
	if (visible) return visible;

	for (const selector of selectors) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (candidate.isConnected) return candidate;
		}
	}

	return null;
}

export function channelsPostUploadFormReady(root: ParentNode): boolean {
	return (
		pickFirstConnectedField(root, CHANNELS_TITLE_SELECTORS) !== null ||
		pickFirstConnectedField(root, CHANNELS_DESCRIPTION_SELECTORS) !== null ||
		pickFirstConnectedField(root, CHANNELS_SHORT_TITLE_SELECTORS) !== null
	);
}
