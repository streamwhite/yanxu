import type { CanonicalJob } from "../schema/canonical-job";
import type { PageField } from "../schema/field-locator";
import { sanitizeText } from "../text/sanitize-text";

function normalizePageFields(pageFields: PageField[] | undefined): PageField[] | undefined {
	if (!pageFields) return undefined;
	return pageFields.map((field) => ({
		...field,
		value: sanitizeText(field.value),
	}));
}

function normalizeV1(
	job: Extract<CanonicalJob, { jobVersion: 1 }>,
): Extract<CanonicalJob, { jobVersion: 1 }> {
	const tags = job.bilibili.tags?.map((tag: string) => sanitizeText(tag));
	return {
		...job,
		bilibili: {
			title: sanitizeText(job.bilibili.title),
			description: sanitizeText(job.bilibili.description),
			...(tags === undefined ? {} : { tags }),
			...(job.bilibili.partition === undefined
				? {}
				: { partition: sanitizeText(job.bilibili.partition) }),
		},
		pageFields: normalizePageFields(job.pageFields),
	};
}

function normalizeV2(
	job: Extract<CanonicalJob, { jobVersion: 2 }>,
): Extract<CanonicalJob, { jobVersion: 2 }> {
	if (!job.bilibili) {
		return {
			...job,
			pageFields: normalizePageFields(job.pageFields),
		};
	}

	const tags = job.bilibili.tags?.map((tag: string) => sanitizeText(tag));
	return {
		...job,
		bilibili: {
			...job.bilibili,
			...(job.bilibili.title === undefined ? {} : { title: sanitizeText(job.bilibili.title) }),
			...(job.bilibili.description === undefined
				? {}
				: { description: sanitizeText(job.bilibili.description) }),
			...(tags === undefined ? {} : { tags }),
			...(job.bilibili.partition === undefined
				? {}
				: { partition: sanitizeText(job.bilibili.partition) }),
		},
		pageFields: normalizePageFields(job.pageFields),
	};
}

export function normalizeCanonicalJobTexts(job: CanonicalJob): CanonicalJob {
	if (job.jobVersion === 1) return normalizeV1(job);
	return normalizeV2(job);
}
