import { PublishMode, SubmitPolicy, type CanonicalJob } from "../schema/canonical-job";

export function assertExtensionSupportedPublishPolicy(job: CanonicalJob): void {
	if (job.publish.mode !== PublishMode.Semi) {
		throw new Error("extension_mvp_only_supports_semi_mode");
	}
	if (job.publish.submit !== SubmitPolicy.Manual) {
		throw new Error("extension_mvp_only_supports_manual_submit");
	}
}
