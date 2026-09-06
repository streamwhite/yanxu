import { constants as fsConstants, promises as fsp } from "node:fs";
import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import {
	listBatchCoverPathCandidates,
	listHorizontalCoverPathCandidates,
} from "@auto-upload/domain";

async function isReadableFile(absolutePath: string): Promise<boolean> {
	if (!isAbsolutePosixOrWin(absolutePath)) return false;

	try {
		const resolved = resolveCrossPlatform(absolutePath);
		await fsp.access(resolved, fsConstants.R_OK);
		const stat = await fsp.stat(resolved);
		return stat.isFile();
	} catch {
		return false;
	}
}

async function resolveExistingPathFromCandidates(
	candidates: string[],
): Promise<string | undefined> {
	for (const candidate of candidates) {
		if (await isReadableFile(candidate)) return candidate;
	}
	return undefined;
}

export async function resolveExistingCoverPath(coverPathHint: string): Promise<string | undefined> {
	return resolveExistingPathFromCandidates(listBatchCoverPathCandidates(coverPathHint));
}

export async function resolveExistingHorizontalCoverPath(
	coverPathHint: string,
): Promise<string | undefined> {
	return resolveExistingPathFromCandidates(listHorizontalCoverPathCandidates(coverPathHint));
}

