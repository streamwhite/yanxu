import { registerApplyJobListener } from "./register-apply-job-listener.js";
import { registerSubmitPlatformListener } from "./register-submit-platform-listener.js";

const LISTENER_REGISTERED_KEY = "__autoUploadFillListenerRegistered__" as const;

const globalRecord = globalThis as typeof globalThis & Record<string, boolean>;

if (!globalRecord[LISTENER_REGISTERED_KEY]) {
	globalRecord[LISTENER_REGISTERED_KEY] = true;
	registerApplyJobListener();
	registerSubmitPlatformListener();
}
