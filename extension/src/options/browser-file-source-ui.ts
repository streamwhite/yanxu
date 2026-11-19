import {
	clearBrowserFileSource,
	loadBrowserAssetsDirHandle,
	loadBrowserFileSource,
	loadBrowserJobFileHandle,
	queryReadPermission,
	requestReadPermission,
	saveBrowserAssetsDirHandle,
	saveBrowserJobFileHandle,
} from "../shared/browser-file-source.js";

const CHOOSE_JOB_BUTTON_ID = "chooseBrowserJobFileButton" as const;
const CHOOSE_ASSETS_BUTTON_ID = "chooseBrowserAssetsDirButton" as const;
const RESTORE_PERMISSION_BUTTON_ID = "restoreBrowserSourcePermissionButton" as const;
const CLEAR_BUTTON_ID = "clearBrowserFileSourceButton" as const;
const STATUS_ID = "browserFileSourceStatus" as const;

function byId(elementId: string): HTMLElement | null {
	return document.getElementById(elementId);
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError";
}

async function renderStatus(
	status: HTMLElement,
	restoreButton: HTMLButtonElement,
	clearButton: HTMLButtonElement,
): Promise<void> {
	const [jobFile, assetsDir] = await Promise.all([
		loadBrowserJobFileHandle(),
		loadBrowserAssetsDirHandle(),
	]);

	if (!jobFile && !assetsDir) {
		status.textContent = "尚未选择任务文件和素材目录。";
		restoreButton.classList.add("d-none");
		clearButton.classList.add("d-none");
		return;
	}
	if (!jobFile) {
		status.textContent = `素材目录：${assetsDir?.name ?? ""}；请选择任务文件。`;
		restoreButton.classList.add("d-none");
		clearButton.classList.remove("d-none");
		return;
	}
	if (!assetsDir) {
		status.textContent = `任务文件：${jobFile.name}；请选择素材目录。`;
		restoreButton.classList.add("d-none");
		clearButton.classList.remove("d-none");
		return;
	}

	const source = await loadBrowserFileSource();
	const [jobPermission, assetsPermission] = source
		? await Promise.all([
				queryReadPermission(source.jobFile),
				queryReadPermission(source.assetsDir),
			])
		: ["granted", "granted"];

	status.textContent = `任务文件：${jobFile.name}；素材目录：${assetsDir.name}`;
	restoreButton.classList.toggle(
		"d-none",
		jobPermission === "granted" && assetsPermission === "granted",
	);
	clearButton.classList.remove("d-none");
}

async function chooseJobFile(
	status: HTMLElement,
	restoreButton: HTMLButtonElement,
	clearButton: HTMLButtonElement,
): Promise<void> {
	const picker = window.showOpenFilePicker;
	if (!picker) {
		status.textContent = "当前浏览器不支持文件选择器。";
		return;
	}
	const [handle] = await picker({
		multiple: false,
		types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
	});
	if (!handle) return;
	await saveBrowserJobFileHandle(handle);
	await renderStatus(status, restoreButton, clearButton);
}

async function chooseAssetsDir(
	status: HTMLElement,
	restoreButton: HTMLButtonElement,
	clearButton: HTMLButtonElement,
): Promise<void> {
	const picker = window.showDirectoryPicker;
	if (!picker) {
		status.textContent = "当前浏览器不支持目录选择器。";
		return;
	}
	const handle = await picker({ mode: "read" });
	await saveBrowserAssetsDirHandle(handle);
	await renderStatus(status, restoreButton, clearButton);
}

async function restorePermission(
	status: HTMLElement,
	restoreButton: HTMLButtonElement,
	clearButton: HTMLButtonElement,
): Promise<void> {
	const source = await loadBrowserFileSource();
	if (!source) {
		await renderStatus(status, restoreButton, clearButton);
		return;
	}
	await Promise.all([
		requestReadPermission(source.jobFile),
		requestReadPermission(source.assetsDir),
	]);
	await renderStatus(status, restoreButton, clearButton);
}

export async function initBrowserFileSourceUi(): Promise<void> {
	const chooseJobButton = byId(CHOOSE_JOB_BUTTON_ID);
	const chooseAssetsButton = byId(CHOOSE_ASSETS_BUTTON_ID);
	const restoreButton = byId(RESTORE_PERMISSION_BUTTON_ID);
	const clearButton = byId(CLEAR_BUTTON_ID);
	const status = byId(STATUS_ID);

	if (!(chooseJobButton instanceof HTMLButtonElement)) return;
	if (!(chooseAssetsButton instanceof HTMLButtonElement)) return;
	if (!(restoreButton instanceof HTMLButtonElement)) return;
	if (!(clearButton instanceof HTMLButtonElement)) return;
	if (!(status instanceof HTMLElement)) return;

	const refresh = () => renderStatus(status, restoreButton, clearButton);

	chooseJobButton.addEventListener("click", () => {
		void chooseJobFile(status, restoreButton, clearButton).catch((error: unknown) => {
			if (isAbortError(error)) return;
			status.textContent = `选择任务文件失败：${error instanceof Error ? error.message : "unknown_error"}`;
		});
	});
	chooseAssetsButton.addEventListener("click", () => {
		void chooseAssetsDir(status, restoreButton, clearButton).catch((error: unknown) => {
			if (isAbortError(error)) return;
			status.textContent = `选择素材目录失败：${error instanceof Error ? error.message : "unknown_error"}`;
		});
	});
	restoreButton.addEventListener("click", () => {
		void restorePermission(status, restoreButton, clearButton).catch((error: unknown) => {
			status.textContent = `恢复访问失败：${error instanceof Error ? error.message : "unknown_error"}`;
		});
	});
	clearButton.addEventListener("click", () => {
		void clearBrowserFileSource()
			.then(refresh)
			.catch((error: unknown) => {
				status.textContent = `清除失败：${error instanceof Error ? error.message : "unknown_error"}`;
			});
	});

	await refresh();
}
