const ESCAPE_KEY = "Escape" as const;
const ESCAPE_CODE = "Escape" as const;
const ESCAPE_KEY_CODE = 27 as const;

const ESCAPE_EVENT_INIT: KeyboardEventInit = {
	key: ESCAPE_KEY,
	code: ESCAPE_CODE,
	keyCode: ESCAPE_KEY_CODE,
	which: ESCAPE_KEY_CODE,
	bubbles: true,
	cancelable: true,
};

export function dispatchEscapeKey(target: HTMLElement = document.body): void {
	target.dispatchEvent(new KeyboardEvent("keydown", ESCAPE_EVENT_INIT));
	target.dispatchEvent(new KeyboardEvent("keyup", ESCAPE_EVENT_INIT));
}
