import { dispatchClick } from "./dispatch-click.js";

export function clickAntCheckboxLabel(label: HTMLElement): void {
	const input = label.querySelector("input.ant-checkbox-input");
	if (input instanceof HTMLElement) {
		dispatchClick(input);
		return;
	}

	dispatchClick(label);
}
