import { constants as fsConstants, promises as fsp } from "node:fs";
import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import { listBatchCoverPathCandidates } from "@auto-upload/domain";

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

export async function resolveExistingCoverPath(
	coverPathHint: string,
): Promise<string | undefined> {
	for (const candidate of listBatchCoverPathCandidates(coverPathHint)) {
		if (await isReadableFile(candidate)) return candidate;
	}
	return undefined;
}
