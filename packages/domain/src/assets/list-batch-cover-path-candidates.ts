import { BATCH_COVER_FILE_EXTENSIONS } from "../constants/batch-assets.js";
import { resolveAssetPathFromParentFolder } from "./resolve-asset-path-from-parent-folder.js";

function splitCoverPathStem(coverPathHint: string): { parentFolder: string; stem: string } {
	const lastSep = Math.max(coverPathHint.lastIndexOf("/"), coverPathHint.lastIndexOf("\\"));
	const parentFolder = lastSep >= 0 ? coverPathHint.slice(0, lastSep) : "";
	const fileName = lastSep >= 0 ? coverPathHint.slice(lastSep + 1) : coverPathHint;
	const dot = fileName.lastIndexOf(".");
	const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
	return { parentFolder, stem };
}

export function listBatchCoverPathCandidates(coverPathHint: string): string[] {
	const { parentFolder, stem } = splitCoverPathStem(coverPathHint);
	return BATCH_COVER_FILE_EXTENSIONS.map((extension) =>
		resolveAssetPathFromParentFolder(parentFolder, `${stem}${extension}`),
	);
}
