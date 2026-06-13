import type { PlatformId } from "@auto-upload/domain";
import { dispatchClick } from "./dispatch-click.js";
import { findPlatformSubmitControl } from "../platforms/find-platform-submit-control.js";

export function clickPlatformSubmitControl(platform: PlatformId): void {
	const control = findPlatformSubmitControl(document, platform);
	if (!control) {
		throw new Error(`platform_submit_control_not_found:${platform}`);
	}

	dispatchClick(control);
}
