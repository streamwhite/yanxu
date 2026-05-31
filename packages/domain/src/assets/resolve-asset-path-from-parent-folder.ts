const PATH_SEPARATOR_PATTERN = /[/\\]/;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[A-Za-z]:[\\/]/;

function isAbsolutePath(path: string): boolean {
	if (path.startsWith("/")) return true;
	return WINDOWS_ABSOLUTE_PATH_PATTERN.test(path);
}

function joinParentAndFileName(parentFolder: string, fileName: string): string {
	const separator = parentFolder.includes("\\") ? "\\" : "/";
	const trimmedParent = parentFolder.replace(/[/\\]+$/, "");
	return `${trimmedParent}${separator}${fileName}`;
}

export function assertAssetFileName(fileName: string): void {
	if (PATH_SEPARATOR_PATTERN.test(fileName)) {
		throw new Error("asset_file_name_must_be_basename");
	}
}

export function resolveAssetPathFromParentFolder(parentFolder: string, fileName: string): string {
	if (!isAbsolutePath(parentFolder)) {
		throw new Error("assets_parent_folder_must_be_absolute");
	}
	assertAssetFileName(fileName);
	return joinParentAndFileName(parentFolder, fileName);
}
