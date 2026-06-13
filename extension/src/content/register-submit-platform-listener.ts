import { PLATFORM_IDS, type PlatformId } from "@auto-upload/domain";
import { clickPlatformSubmitControl } from "./click-platform-submit-control.js";
import { ContentMessageType } from "./content-message-type.js";

function isPlatformId(value: unknown): value is PlatformId {
	return typeof value === "string" && (PLATFORM_IDS as readonly string[]).includes(value);
}

export function registerSubmitPlatformListener(): void {
	chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
		if (!message || typeof message !== "object") return undefined;
		const candidate = message as { type?: unknown; platform?: unknown };
		if (candidate.type !== ContentMessageType.SubmitPlatform) return undefined;

		if (!isPlatformId(candidate.platform)) {
			sendResponse({ ok: false, message: "invalid_submit_platform" });
			return true;
		}

		try {
			clickPlatformSubmitControl(candidate.platform);
			sendResponse({ ok: true });
		} catch (error: unknown) {
			const messageText = error instanceof Error ? error.message : "unexpected_error";
			sendResponse({ ok: false, message: messageText });
		}

		return true;
	});
}
