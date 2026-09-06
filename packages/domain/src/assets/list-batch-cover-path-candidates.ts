import { BATCH_COVER_FILE_EXTENSIONS, BATCH_HORIZONTAL_COVER_SUFFIX } from "../constants/batch-assets.js";
import { resolveAssetPathFromParentFolder } from "./resolve-asset-path-from-parent-folder.js";

function splitCoverPathStem(coverPathHint: string): { parentFolder: string; stem: string } {
	const lastSep = Math.max(coverPathHint.lastIndexOf("/"), coverPathHint.lastIndexOf("\\"));
	const parentFolder = lastSep >= 0 ? coverPathHint.slice(0, lastSep) : "";
	const fileName = lastSep >= 0 ? coverPathHint.slice(lastSep + 1) : coverPathHint;
	const dot = fileName.lastIndexOf(".");
	const stem = dot > 0 ? fileName.slice(0, dot) : fileName;
	return { parentFolder, stem };
}

function listStemCandidates(parentFolder: string, stem: string): string[] {
	return BATCH_COVER_FILE_EXTENSIONS.map((extension) =>
		resolveAssetPathFromParentFolder(parentFolder, `${stem}${extension}`),
	);
}

export function listBatchCoverPathCandidates(coverPathHint: string): string[] {
	const { parentFolder, stem } = splitCoverPathStem(coverPathHint);
	return listStemCandidates(parentFolder, stem);
}

/** Horizontal (4:3) cover candidates: `{cover stem}-4x3{extension}`. */
export function listHorizontalCoverPathCandidates(coverPathHint: string): string[] {
	const { parentFolder, stem } = splitCoverPathStem(coverPathHint);
	return listStemCandidates(parentFolder, `${stem}${BATCH_HORIZONTAL_COVER_SUFFIX}`);
}

