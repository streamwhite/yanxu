import type {
	BrowserFileSource,
	BrowserFileSourceSummary,
} from "../shared/browser-file-source.js";

export function formatBrowserFileSourceStatus(
	source: BrowserFileSource,
	summary: BrowserFileSourceSummary | null,
): string {
	const jobPath = summary?.jobAbsolutePath ?? source.jobFile.name;
	const assetsPath = summary?.assetsAbsolutePath ?? source.assetsDir.name;
	return `任务：${jobPath}；素材文件夹：${assetsPath}`;
}

export function isPermissionRestoreRequired(code: string): boolean {
	return code === "browser_source_permission_required";
}
