import { findCoverTriggerForPlatform } from "./find-cover-trigger-for-platform.js";

/** @deprecated Use findCoverTriggerForPlatform with an explicit platform. */
export function findCoverTrigger(root: ParentNode): HTMLElement | null {
	return findCoverTriggerForPlatform(root, "bilibili");
}

export { findCoverTriggerForPlatform };
