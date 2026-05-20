export function isElementVisible(element: HTMLElement): boolean {
	if (typeof element.checkVisibility === "function") {
		try {
			return element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
		} catch {
			//
		}
	}

	const style = globalThis.getComputedStyle(element);
	if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
		return false;
	}

	const rect = element.getBoundingClientRect();
	if (rect.width > 0 && rect.height > 0) return true;

	return element.isConnected;
}
