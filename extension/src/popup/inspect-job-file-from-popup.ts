import {
	RuntimeMessageType,
	type InspectJobFileRuntimeResult,
} from "../runtime/runtime-message.js";
import { sendPingToServiceWorker } from "./send-runtime-message.js";

export async function inspectJobFileFromPopup(
	jobFilePath: string,
): Promise<InspectJobFileRuntimeResult> {
	await sendPingToServiceWorker();
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{ type: RuntimeMessageType.InspectJobFile, jobFilePath },
			(response: InspectJobFileRuntimeResult | undefined) => {
				const lastError = chrome.runtime.lastError;
				if (lastError?.message) {
					reject(new Error(lastError.message));
					return;
				}
				if (!response || typeof response !== "object" || !("ok" in response)) {
					reject(new Error("inspect_failed"));
					return;
				}
				resolve(response);
			},
		);
	});
}
