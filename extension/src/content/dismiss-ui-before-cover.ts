import { blurActiveElement } from "./blur-active-element.js";
import { dispatchEscapeKey } from "./dispatch-escape-key.js";

const ESCAPE_DISMISS_COUNT = 2 as const;

export function dismissUiBeforeCover(): void {
	for (let index = 0; index < ESCAPE_DISMISS_COUNT; index++) {
		dispatchEscapeKey(document.body);
		const active = document.activeElement;
		if (active instanceof HTMLElement && active !== document.body) {
			dispatchEscapeKey(active);
		}
	}

	blurActiveElement();
}
