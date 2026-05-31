import { isElementVisible } from "./is-element-visible.js";
import { queryAllDeep } from "./query-all-deep.js";

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

export function pickFirstElementDeep<T extends HTMLElement>(
	root: ParentNode,
	selectors: readonly string[],
): T | null {
	for (const selector of selectors) {
		const found = queryAllDeep(root, selector)[0];
		if (found instanceof HTMLElement) return found as T;
	}
	return null;
}

export function pickFirstVisibleElementDeep<T extends HTMLElement>(
	root: ParentNode,
	selectors: readonly string[],
): T | null {
	for (const selector of selectors) {
		for (const candidate of queryAllDeep(root, selector)) {
			if (isElementVisible(candidate)) return candidate as T;
		}
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

export function isContentEditableElement(element: HTMLElement): boolean {
	if (element.isContentEditable) return true;
	return element.hasAttribute("contenteditable");
}

export function setContentEditableText(element: HTMLElement, value: string): void {
	element.focus();

	if (typeof document.execCommand === "function") {
		document.execCommand("selectAll", false);
		document.execCommand("insertText", false, value);
	} else {
		element.textContent = value;
	}

	element.dispatchEvent(
		new InputEvent("beforeinput", {
			bubbles: true,
			cancelable: true,
			inputType: "insertText",
			data: value,
		}),
	);
	element.dispatchEvent(
		new InputEvent("input", {
			bubbles: true,
			cancelable: true,
			inputType: "insertText",
			data: value,
		}),
	);
	element.dispatchEvent(new Event("change", { bubbles: true }));
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
