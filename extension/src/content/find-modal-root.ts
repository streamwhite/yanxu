const MODAL_ROOT_SELECTORS = [
	'[class*="modal"]',
	'[class*="dialog"]',
	'[class*="popup"]',
	'[class*="layer"]',
] as const;

export function findModalRoot(anchor: HTMLElement): ParentNode {
	for (const selector of MODAL_ROOT_SELECTORS) {
		const found = anchor.closest(selector);
		if (found instanceof HTMLElement) return found;
	}

	return anchor.parentElement ?? document.body;
}
