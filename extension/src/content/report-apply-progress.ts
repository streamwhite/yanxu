import type { PlatformId } from "@auto-upload/domain";
import { ContentMessageType } from "./content-message-type.js";
import type { BatchProgressKind } from "../shared/batch-progress.js";

export type ApplyProgressInput = {
	platform: PlatformId;
	itemIndex: number;
	kind: BatchProgressKind;
	label: string;
};

export function reportApplyProgress(input: ApplyProgressInput): void {
	if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) return;
	void chrome.runtime.sendMessage({
		type: ContentMessageType.ApplyProgress,
		platform: input.platform,
		itemIndex: input.itemIndex,
		kind: input.kind,
		label: input.label,
	});
}
