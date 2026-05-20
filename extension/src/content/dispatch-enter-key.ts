const ENTER_KEY = "Enter" as const;
const ENTER_CODE = "Enter" as const;
const ENTER_KEY_CODE = 13 as const;

export function dispatchEnterKey(element: HTMLElement): void {
	const init: KeyboardEventInit = {
		key: ENTER_KEY,
		code: ENTER_CODE,
		keyCode: ENTER_KEY_CODE,
		which: ENTER_KEY_CODE,
		bubbles: true,
		cancelable: true,
	};

	element.dispatchEvent(new KeyboardEvent("keydown", init));
	element.dispatchEvent(new KeyboardEvent("keypress", init));
	element.dispatchEvent(new KeyboardEvent("keyup", init));
}
