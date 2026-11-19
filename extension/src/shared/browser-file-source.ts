import { JOB_ASSETS_PARENT_FOLDER, parseJobFile } from "./parse-job-file.js";

export const BROWSER_JOB_FILE_PATH = "browser://selected-job" as const;

export const BROWSER_FILE_SOURCE_SUMMARY_KEY = "browserFileSourceSummary" as const;

const DB_NAME = "yanxu-browser-file-source" as const;
const DB_VERSION = 1 as const;
const HANDLE_STORE = "handles" as const;
const JOB_HANDLE_KEY = "jobFile" as const;
const ASSETS_HANDLE_KEY = "assetsDir" as const;

export type BrowserFileSource = {
	jobFile: FileSystemFileHandle;
	assetsDir: FileSystemDirectoryHandle;
};

export type BrowserFileSourceSummary = {
	jobFileName: string;
	jobAbsolutePath?: string;
	assetsDirName: string;
	assetsAbsolutePath?: string;
	updatedAt: number;
};

function openHandleDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(HANDLE_STORE)) {
				request.result.createObjectStore(HANDLE_STORE);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error("browser_source_db_open_failed"));
	});
}

async function putHandle(key: string, handle: FileSystemHandle): Promise<void> {
	const db = await openHandleDb();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(HANDLE_STORE, "readwrite");
			transaction.objectStore(HANDLE_STORE).put(handle, key);
			transaction.oncomplete = () => resolve();
			transaction.onerror = () =>
				reject(transaction.error ?? new Error("browser_source_handle_save_failed"));
		});
	} finally {
		db.close();
	}
}

async function getHandle<T extends FileSystemHandle>(key: string): Promise<T | null> {
	const db = await openHandleDb();
	try {
		return await new Promise<T | null>((resolve, reject) => {
			const transaction = db.transaction(HANDLE_STORE, "readonly");
			const request = transaction.objectStore(HANDLE_STORE).get(key);
			request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
			request.onerror = () =>
				reject(request.error ?? new Error("browser_source_handle_read_failed"));
		});
	} finally {
		db.close();
	}
}

export function loadBrowserJobFileHandle(): Promise<FileSystemFileHandle | null> {
	return getHandle<FileSystemFileHandle>(JOB_HANDLE_KEY);
}

export function loadBrowserAssetsDirHandle(): Promise<FileSystemDirectoryHandle | null> {
	return getHandle<FileSystemDirectoryHandle>(ASSETS_HANDLE_KEY);
}

export async function loadBrowserFileSource(): Promise<BrowserFileSource | null> {
	const [jobFile, assetsDir] = await Promise.all([
		loadBrowserJobFileHandle(),
		loadBrowserAssetsDirHandle(),
	]);
	if (!jobFile || !assetsDir) return null;
	return { jobFile, assetsDir };
}

export async function saveBrowserFileSource(source: BrowserFileSource): Promise<void> {
	await putHandle(JOB_HANDLE_KEY, source.jobFile);
	await putHandle(ASSETS_HANDLE_KEY, source.assetsDir);
	await refreshBrowserFileSourceSummary();
}

export async function saveBrowserJobFileHandle(handle: FileSystemFileHandle): Promise<void> {
	await putHandle(JOB_HANDLE_KEY, handle);
	await refreshBrowserFileSourceSummary();
}

export async function saveBrowserAssetsDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
	await putHandle(ASSETS_HANDLE_KEY, handle);
	await refreshBrowserFileSourceSummary();
}

async function readAssetsAbsolutePath(jobFile: FileSystemFileHandle): Promise<string | undefined> {
	try {
		const file = await jobFile.getFile();
		const parsed = (await parseJobFile(file)) as {
			assetsParentFolder?: unknown;
			assets?: { localVideoPath?: unknown };
		};
		if (
			typeof parsed.assetsParentFolder === "string" &&
			parsed.assetsParentFolder !== JOB_ASSETS_PARENT_FOLDER
		) {
			return parsed.assetsParentFolder;
		}
		if (typeof parsed.assets?.localVideoPath === "string") {
			const normalized = parsed.assets.localVideoPath.replaceAll("\\", "/");
			const slash = normalized.lastIndexOf("/");
			return slash > 0 ? normalized.slice(0, slash) : undefined;
		}
	} catch {
		//
	}
	return undefined;
}

async function readJobAbsolutePath(
	source: BrowserFileSource,
	assetsAbsolutePath: string | undefined,
): Promise<string | undefined> {
	if (!assetsAbsolutePath) return undefined;
	try {
		const relative = await source.assetsDir.resolve(source.jobFile);
		if (!relative || relative.length === 0) return undefined;
		const separator = assetsAbsolutePath.includes("\\") ? "\\" : "/";
		const base = assetsAbsolutePath.replace(/[\\/]+$/, "");
		return [base, ...relative].join(separator);
	} catch {
		return undefined;
	}
}

export async function refreshBrowserFileSourceSummary(): Promise<void> {
	const source = await loadBrowserFileSource();
	if (!source) {
		await chrome.storage.local.remove(BROWSER_FILE_SOURCE_SUMMARY_KEY);
		return;
	}
	const assetsAbsolutePath = await readAssetsAbsolutePath(source.jobFile);
	const summary: BrowserFileSourceSummary = {
		jobFileName: source.jobFile.name,
		jobAbsolutePath: await readJobAbsolutePath(source, assetsAbsolutePath),
		assetsDirName: source.assetsDir.name,
		assetsAbsolutePath,
		updatedAt: Date.now(),
	};
	await chrome.storage.local.set({ [BROWSER_FILE_SOURCE_SUMMARY_KEY]: summary });
}

export async function clearBrowserFileSource(): Promise<void> {
	const db = await openHandleDb();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(HANDLE_STORE, "readwrite");
			transaction.objectStore(HANDLE_STORE).delete(JOB_HANDLE_KEY);
			transaction.objectStore(HANDLE_STORE).delete(ASSETS_HANDLE_KEY);
			transaction.oncomplete = () => resolve();
			transaction.onerror = () =>
				reject(transaction.error ?? new Error("browser_source_handle_clear_failed"));
		});
	} finally {
		db.close();
	}
	await chrome.storage.local.remove(BROWSER_FILE_SOURCE_SUMMARY_KEY);
}

export async function loadBrowserFileSourceSummary(): Promise<BrowserFileSourceSummary | null> {
	const stored = await chrome.storage.local.get(BROWSER_FILE_SOURCE_SUMMARY_KEY);
	const value = stored[BROWSER_FILE_SOURCE_SUMMARY_KEY];
	if (!value || typeof value !== "object") return null;
	const summary = value as Partial<BrowserFileSourceSummary>;
	if (
		typeof summary.jobFileName !== "string" ||
		typeof summary.assetsDirName !== "string" ||
		typeof summary.updatedAt !== "number"
	) {
		return null;
	}
	return summary as BrowserFileSourceSummary;
}

type PermissionHandle = FileSystemHandle & {
	queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
	requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
};

export async function queryReadPermission(handle: FileSystemHandle): Promise<PermissionState> {
	const permissionHandle = handle as PermissionHandle;
	if (!permissionHandle.queryPermission) return "granted";
	return permissionHandle.queryPermission({ mode: "read" });
}

export async function requestReadPermission(handle: FileSystemHandle): Promise<PermissionState> {
	const permissionHandle = handle as PermissionHandle;
	if (!permissionHandle.requestPermission) return "granted";
	return permissionHandle.requestPermission({ mode: "read" });
}

export async function browserFileSourceNeedsPermission(
	source: BrowserFileSource,
): Promise<boolean> {
	const [jobPermission, dirPermission] = await Promise.all([
		queryReadPermission(source.jobFile),
		queryReadPermission(source.assetsDir),
	]);
	return jobPermission === "prompt" || dirPermission === "prompt";
}
