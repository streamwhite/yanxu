import type { BrowserFileSource } from "../../extension/src/shared/browser-file-source";
import {
	formatBrowserFileSourceStatus,
	isPermissionRestoreRequired,
} from "../../extension/src/popup/browser-file-source-status";

describe("browser file source status", () => {
	it("shows selected file and folder names when the cached summary is missing", () => {
		const source = {
			jobFile: { name: "job.json" },
			assetsDir: { name: "covert to mp4" },
		} as BrowserFileSource;

		expect(formatBrowserFileSourceStatus(source, null)).toBe(
			"任务：job.json；素材文件夹：covert to mp4",
		);
	});

	it("redirects to options only when the runtime reports a restore-permission error", () => {
		expect(isPermissionRestoreRequired("browser_source_permission_required")).toBe(true);
		expect(isPermissionRestoreRequired("browser_source_missing")).toBe(false);
		expect(isPermissionRestoreRequired("tab_apply_failed")).toBe(false);
	});
});
