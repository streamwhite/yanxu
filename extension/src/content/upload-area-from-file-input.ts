const DEFAULT_UPLOAD_AREA_SELECTORS = [
	'[class*="upload-card"]',
	'[class*="upload-btn"]',
	".upload-area",
	".upload-content",
] as const;

export function uploadAreaFromFileInput(
	input: HTMLInputElement,
	areaSelectors: readonly string[] = DEFAULT_UPLOAD_AREA_SELECTORS,
): HTMLElement | null {
	for (const selector of areaSelectors) {
		const area = input.closest(selector);
		if (area instanceof HTMLElement) return area;
	}

	const parent = input.parentElement;
	if (!parent) return input;

	for (const selector of areaSelectors) {
		const sibling = parent.querySelector(selector);
		if (sibling instanceof HTMLElement) return sibling;
	}

	return input;
}
