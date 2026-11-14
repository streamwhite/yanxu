import { getJobPlatform, type AppliedJobPayload, type CanonicalJob } from "@yanxu/domain";

const PATH_SEPARATOR_PATTERN = /[/\\]/;

function basenameFromPath(filePath: string): string {
	const segments = filePath.split(PATH_SEPARATOR_PATTERN);
	return segments.at(-1) ?? filePath;
}

function assertVideoFileMatchesJob(payload: AppliedJobPayload, job: CanonicalJob): void {
	const expectedName = basenameFromPath(job.assets.localVideoPath);
	const video = payload.attachments.video;

	if (video.kind === "manualLargeFile") {
		const actualName = basenameFromPath(video.absolutePath);
		if (actualName !== expectedName) {
			throw new Error(`batch_video_mismatch:${expectedName}:${actualName}`);
		}
		return;
	}

	if (video.kind !== "inlineBase64Chunks") return;

	const actualName = video.suggestedFileName ?? "";
	if (actualName !== expectedName) {
		throw new Error(`batch_video_mismatch:${expectedName}:${actualName}`);
	}
}

export function assertBatchPayloadMatchesJob(payload: AppliedJobPayload, job: CanonicalJob): void {
	const jobPlatform = getJobPlatform(job);
	if (payload.batch.targetPlatform !== jobPlatform) {
		throw new Error(`batch_platform_mismatch:${payload.batch.targetPlatform}:${jobPlatform}`);
	}

	if (payload.batch.itemIndex < 0) {
		throw new Error("batch_item_index_invalid");
	}

	assertVideoFileMatchesJob(payload, job);
}
