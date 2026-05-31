import type { PlatformId } from "@auto-upload/domain";
import { COVER_TRIGGER_OPEN_WAIT_MS } from "./constants/cover-modal-timing.js";
import { dispatchClick } from "./dispatch-click.js";
import { waitForCoverModalUploadArea } from "./wait-for-cover-modal-upload-area.js";

function clickCoverTriggerOnce(trigger: HTMLElement): void {
	if (typeof trigger.scrollIntoView === "function") {
		trigger.scrollIntoView({ block: "center", inline: "nearest" });
	}

	const editText = trigger.querySelector(".edit-text");
	const target = editText instanceof HTMLElement ? editText : trigger;
	dispatchClick(target);
}

export async function clickCoverTrigger(trigger: HTMLElement, platform: PlatformId): Promise<void> {
	clickCoverTriggerOnce(trigger);

	const opened = await waitForCoverModalUploadArea(document, COVER_TRIGGER_OPEN_WAIT_MS, platform);
	if (opened) return;

	clickCoverTriggerOnce(trigger);
	await waitForCoverModalUploadArea(document, COVER_TRIGGER_OPEN_WAIT_MS, platform);
}
