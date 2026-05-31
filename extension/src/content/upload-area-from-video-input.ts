export function uploadAreaFromVideoInput(
	input: HTMLInputElement,
	areaSelector: string,
): HTMLElement {
	const area = input.closest(areaSelector);
	return area instanceof HTMLElement ? area : input;
}
