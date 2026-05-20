export function pickFirstElement<T extends HTMLElement>(
	root: ParentNode,
	selectors: readonly string[],
): T | null {
	for (const selector of selectors) {
		const found = root.querySelector(selector);
		if (found instanceof HTMLElement) return found as T;
	}
	return null;
}

export function setFormControlValue(
	element: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): void {
	element.focus();
	element.value = value;
	element.dispatchEvent(new Event("input", { bubbles: true }));
	element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setContentEditableText(element: HTMLElement, value: string): void {
	element.focus();
	element.textContent = value;
	element.dispatchEvent(new Event("input", { bubbles: true }));
}

function assignFilesWithoutDataTransfer(input: HTMLInputElement, file: File): void {
	const fileList = Object.assign([file], {
		item: (index: number) => (index === 0 ? file : null),
	});
	Object.defineProperty(input, "files", { value: fileList, configurable: true });
}

export function assignFileToInput(input: HTMLInputElement, file: File): void {
	input.focus();

	if (typeof DataTransfer === "undefined") {
		assignFilesWithoutDataTransfer(input, file);
	} else {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(file);
		input.files = dataTransfer.files;
	}

	input.dispatchEvent(new InputEvent("input", { bubbles: true, cancelable: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
}
