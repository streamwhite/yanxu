import { normalizeUiText } from "../../content/normalize-ui-text.js";

export function assignBilibiliPartitionDisplayText(display: HTMLElement, value: string): void {
	const text = normalizeUiText(value);
	display.textContent = ` ${text} `;
	display.dispatchEvent(new Event("input", { bubbles: true }));
	display.dispatchEvent(new Event("change", { bubbles: true }));
}
