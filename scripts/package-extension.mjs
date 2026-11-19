import { spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const EXTENSION_DIR = path.join(ROOT_DIR, "extension");
const OUTPUT_DIR = path.join(ROOT_DIR, "packages-out");
const ZIP_BINARY = "zip";

/** Runtime files only: store packages must not ship TypeScript sources. */
export const ZIP_ENTRIES = [
	"manifest.json",
	"popup.html",
	"popup.css",
	"options.html",
	"options.css",
	"dist",
	"icons",
];
export const SKIPPED_PATTERNS = [
	"*.map",
	".DS_Store",
	"icons/icon.svg",
	// Stale bundle left in dist by an older build; manifest no longer loads it.
	"dist/content-bilibili-fill.js",
];

async function readManifestVersion() {
	const manifest = JSON.parse(await readFile(path.join(EXTENSION_DIR, "manifest.json"), "utf8"));
	if (typeof manifest.version !== "string" || manifest.version.length === 0) {
		throw new Error("extension/manifest.json is missing a version");
	}
	return manifest.version;
}

/** License files required when distributing the packaged extension. */
const ROOT_DOC_ENTRIES = ["LICENSE", "NOTICE"];

function createZip(archivePath) {
	const args = ["-r", "-X", "-q", archivePath, ...ZIP_ENTRIES, "-x", ...SKIPPED_PATTERNS];
	const result = spawnSync(ZIP_BINARY, args, { cwd: EXTENSION_DIR, stdio: "inherit" });
	if (result.error) {
		throw new Error(`failed to run ${ZIP_BINARY}: ${result.error.message}`);
	}
	if (result.status !== 0) {
		throw new Error(`${ZIP_BINARY} exited with status ${String(result.status)}`);
	}
}

function addRootDocs(archivePath) {
	const args = ["-j", "-X", "-q", archivePath, ...ROOT_DOC_ENTRIES];
	const result = spawnSync(ZIP_BINARY, args, { cwd: ROOT_DIR, stdio: "inherit" });
	if (result.error) {
		throw new Error(`failed to run ${ZIP_BINARY}: ${result.error.message}`);
	}
	if (result.status !== 0) {
		throw new Error(`${ZIP_BINARY} exited with status ${String(result.status)}`);
	}
}

async function main() {
	const version = await readManifestVersion();
	await mkdir(OUTPUT_DIR, { recursive: true });

	const chromeArchive = path.join(OUTPUT_DIR, `yanxu-chrome-${version}.zip`);
	const edgeArchive = path.join(OUTPUT_DIR, `yanxu-edge-${version}.zip`);

	await rm(chromeArchive, { force: true });
	await rm(edgeArchive, { force: true });

	createZip(chromeArchive);
	addRootDocs(chromeArchive);
	await copyFile(chromeArchive, edgeArchive);

	console.info(`[package] ${path.relative(ROOT_DIR, chromeArchive)}`);
	console.info(`[package] ${path.relative(ROOT_DIR, edgeArchive)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	void main().catch((error) => {
		console.error(`[package] ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	});
}
