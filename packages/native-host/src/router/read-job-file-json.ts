import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import { constants as fsConstants, promises as fsp } from "node:fs";

export async function readJobFileJson(jobFilePath: string): Promise<unknown> {
	if (!isAbsolutePosixOrWin(jobFilePath)) {
		throw new Error("job_file_path_must_be_absolute");
	}

	const resolvedJobFilePath = resolveCrossPlatform(jobFilePath);
	await fsp.access(resolvedJobFilePath, fsConstants.R_OK);
	const rawText = await fsp.readFile(resolvedJobFilePath, "utf8");
	return JSON.parse(rawText) as unknown;
}
