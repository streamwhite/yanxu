import { getJobPlatform, Platform, type CanonicalJob } from "@auto-upload/domain";
import { buildDefaultBilibiliPageFields } from "../content/bilibili-default-fields.js";
import type { ApplyPageField } from "../content/page-field-apply.js";
import { buildDefaultChannelsPageFields } from "./channels/channels-default-fields.js";
import { buildDefaultDouyinPageFields } from "./douyin/douyin-default-fields.js";

function buildDefaultPageFieldsForPlatform(job: CanonicalJob): ApplyPageField[] {
	const platform = getJobPlatform(job);
	if (platform === Platform.Bilibili) return buildDefaultBilibiliPageFields(job);
	if (platform === Platform.Douyin) return buildDefaultDouyinPageFields(job);
	return buildDefaultChannelsPageFields(job);
}

export function resolvePageFieldsForJob(job: CanonicalJob): ApplyPageField[] {
	const custom: ApplyPageField[] = (job.pageFields ?? []).map((field) => ({ ...field }));
	const defaults = buildDefaultPageFieldsForPlatform(job);
	return [...defaults, ...custom];
}
