import { dispatchClick } from "./dispatch-click.js";
import { findClickableByTextHint } from "./find-clickable-by-text-hint.js";

export function clickModalConfirmByHints(
	root: ParentNode,
	hints: readonly string[],
): boolean {
	for (const hint of hints) {
		const button = findClickableByTextHint(root, hint);
		if (!button) continue;
		dispatchClick(button);
		return true;
	}
	return false;
}
