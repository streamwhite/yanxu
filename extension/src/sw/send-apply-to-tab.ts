import type { AppliedJobPayload, HostOutboundMessage } from "@yanxu/domain";
import { sendApplyBatchToTab } from "./send-apply-batch-to-tab.js";

export async function sendApplyPayloadToTab(
	tabId: number,
	payload: AppliedJobPayload,
): Promise<void> {
	const batch: HostOutboundMessage[] = [
		{
			type: "applyJobReady",
			payload,
		},
	];
	await sendApplyBatchToTab(tabId, batch);
}
