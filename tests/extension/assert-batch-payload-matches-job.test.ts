import {
	ApplyPhase,
	PublishMode,
	projectBatchItemToCanonicalJob,
	SubmitPolicy,
	type AppliedJobPayload,
	validateJobFile,
} from "@yanxu/domain";
import { assertBatchPayloadMatchesJob } from "../../extension/src/content/assert-batch-payload-matches-job";

describe("assertBatchPayloadMatchesJob", () => {
	const batch = {
		jobVersion: 3 as const,
		assetsParentFolder: "/tmp/media",
		publish: { mode: PublishMode.Semi, submit: SubmitPolicy.Manual },
		items: [{ targets: ["channels"] as const, name: "clip-b" }],
	};

	const parsed = validateJobFile(batch);
	if (!parsed.ok || parsed.kind !== "batch") throw new Error("expected batch");
	const job = projectBatchItemToCanonicalJob(parsed.job, 0, "channels");

	it("accepts matching platform and video file name", () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.VideoOnly,
			jobJson: "{}",
			batch: { itemIndex: 0, targetPlatform: "channels" },
			attachments: {
				video: {
					kind: "inlineBase64Chunks",
					mimeType: "video/mp4",
					chunks: ["YQ=="],
					suggestedFileName: "clip-b.mp4",
				},
				cover: { kind: "skipped", reasonCode: "video_only_phase" },
			},
		};

		expect(() => assertBatchPayloadMatchesJob(payload, job)).not.toThrow();
	});

	it("rejects wrong video file for batch item", () => {
		const payload: AppliedJobPayload = {
			applyPhase: ApplyPhase.VideoOnly,
			jobJson: "{}",
			batch: { itemIndex: 0, targetPlatform: "channels" },
			attachments: {
				video: {
					kind: "inlineBase64Chunks",
					mimeType: "video/mp4",
					chunks: ["YQ=="],
					suggestedFileName: "clip-a.mp4",
				},
				cover: { kind: "skipped", reasonCode: "video_only_phase" },
			},
		};

		expect(() => assertBatchPayloadMatchesJob(payload, job)).toThrow(/batch_video_mismatch/);
	});
});
