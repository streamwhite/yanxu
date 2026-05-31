const MOUSE_EVENT_INIT: MouseEventInit = { bubbles: true, cancelable: true };

export function dispatchClick(element: HTMLElement): void {
	element.dispatchEvent(new MouseEvent("mousedown", MOUSE_EVENT_INIT));
	element.dispatchEvent(new MouseEvent("mouseup", MOUSE_EVENT_INIT));
	element.click();
}
