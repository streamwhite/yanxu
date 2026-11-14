import type { ApplyJobFromRuntimeResult } from "../runtime/runtime-message.js";

type UploadStep = () => Promise<ApplyJobFromRuntimeResult>;

export type UploadFlowResult = {
	stage: "openTabs" | "apply";
	result: ApplyJobFromRuntimeResult;
};

/** Open the upload tabs first, then attach video and fill fields on them. */
export async function startUploadFlow(
	openTabs: UploadStep,
	apply: UploadStep,
): Promise<UploadFlowResult> {
	const opened = await openTabs();
	if (!opened.ok) return { stage: "openTabs", result: opened };
	return { stage: "apply", result: await apply() };
}
