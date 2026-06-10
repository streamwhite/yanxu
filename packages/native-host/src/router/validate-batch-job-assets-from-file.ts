import { constants as fsConstants, promises as fsp } from "node:fs";
import { isAbsolute as isAbsolutePosixOrWin, resolve as resolveCrossPlatform } from "node:path";
import {
	BatchAssetKind,
	formatMissingBatchAssetsMessage,
	listRequiredBatchAssets,
	normalizeBatchJobTexts,
	type MissingBatchAsset,
	validateJobFile,
} from "@auto-upload/domain";
import { resolveExistingCoverPath } from "../assets/resolve-existing-cover-path.js";

const ERROR_BATCH_ASSETS_MISSING = "batch_assets_missing" as const;
const ERROR_INVALID_JOB = "invalid_job" as const;
const ERROR_BATCH_JOB_REQUIRED = "batch_job_required" as const;
const BATCH_JOB_VERSION = 3 as const;

function resolveAbsolutePath(absolutePath: string): string {
	if (!isAbsolutePosixOrWin(absolutePath)) {
		throw new Error("paths_must_be_absolute");
	}
	return resolveCrossPlatform(absolutePath);
}

async function isReadableFile(absolutePath: string): Promise<boolean> {
	try {
		const resolved = resolveAbsolutePath(absolutePath);
		await fsp.access(resolved, fsConstants.R_OK);
		const stat = await fsp.stat(resolved);
		return stat.isFile();
	} catch {
		return false;
	}
}

async function collectMissingAssets(
	required: ReturnType<typeof listRequiredBatchAssets>,
): Promise<MissingBatchAsset[]> {
	const missing: MissingBatchAsset[] = [];

	for (const asset of required) {
		if (asset.kind === BatchAssetKind.Cover) {
			const resolved = await resolveExistingCoverPath(asset.absolutePath);
			if (!resolved) missing.push(asset);
			continue;
		}

		const readable = await isReadableFile(asset.absolutePath);
		if (!readable) missing.push(asset);
	}

	return missing;
}

export async function validateBatchJobAssetsFromFileJson(rawJson: unknown) {
	const validated = validateJobFile(rawJson);
	if (!validated.ok) {
		return { ok: false as const, code: ERROR_INVALID_JOB, message: validated.errorMessage };
	}

	if (validated.kind !== "batch") {
		return {
			ok: false as const,
			code: ERROR_BATCH_JOB_REQUIRED,
			message: `batch job required (jobVersion ${String(BATCH_JOB_VERSION)})`,
		};
	}

	const batch = normalizeBatchJobTexts(validated.job);
	const missing = await collectMissingAssets(listRequiredBatchAssets(batch));
	if (missing.length === 0) return { ok: true as const };

	return {
		ok: false as const,
		code: ERROR_BATCH_ASSETS_MISSING,
		message: formatMissingBatchAssetsMessage(missing),
		missing,
	};
}
