import { spawnSync } from "node:child_process";
import esbuild from "esbuild";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT_DIR = path.join(ROOT_DIR, "packages-out");
const CACHE_DIR = path.join(OUT_DIR, ".cache");
const OUTPUT_EXE = path.join(OUT_DIR, "yanxu-native-host-win-x64.exe");
const DOMAIN_INDEX = path.join(ROOT_DIR, "packages/domain/src/index.ts");

const NODE_VERSION = process.versions.node;
const NODE_WIN_ZIP = `node-v${NODE_VERSION}-win-x64.zip`;
const NODE_WIN_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_WIN_ZIP}`;
const NODE_SEA_FUSE = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";
const POSTJECT_VERSION = "1.0.0-alpha.6";

function run(command, args, options = {}) {
	const result = spawnSync(command, args, {
		cwd: options.cwd ?? ROOT_DIR,
		stdio: "inherit",
		shell: options.shell ?? false,
	});
	if (result.error) throw new Error(`${command} failed: ${result.error.message}`);
	if (result.status !== 0) {
		throw new Error(`${command} exited with status ${String(result.status)}`);
	}
}

async function download(url, destination) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`download failed (${String(response.status)}): ${url}`);
	}
	await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

async function resolveWindowsNodeExe(workDir) {
	if (process.platform === "win32" && process.arch === "x64") {
		return process.execPath;
	}

	await mkdir(CACHE_DIR, { recursive: true });
	const zipPath = path.join(CACHE_DIR, NODE_WIN_ZIP);
	try {
		await readFile(zipPath);
	} catch {
		console.info(`[native-host-sea] downloading ${NODE_WIN_URL}`);
		await download(NODE_WIN_URL, zipPath);
	}

	const extractDir = path.join(workDir, "node-win");
	run("unzip", ["-q", zipPath, "-d", extractDir]);
	return path.join(extractDir, `node-v${NODE_VERSION}-win-x64`, "node.exe");
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const workDir = await mkdtemp(path.join(os.tmpdir(), "yanxu-native-host-sea-"));

	try {
		await esbuild.build({
			entryPoints: [path.join(ROOT_DIR, "packages/native-host/src/main.ts")],
			outfile: path.join(workDir, "main.cjs"),
			bundle: true,
			platform: "node",
			format: "cjs",
			target: ["node20"],
			alias: { "@yanxu/domain": DOMAIN_INDEX },
			logLevel: "info",
		});

		await writeFile(
			path.join(workDir, "sea-config.json"),
			`${JSON.stringify(
				{
					main: "main.cjs",
					output: "sea-prep.blob",
					disableExperimentalSEAWarning: true,
				},
				null,
				2,
			)}\n`,
			"utf8",
		);

		run(process.execPath, ["--experimental-sea-config", "sea-config.json"], {
			cwd: workDir,
		});

		const nodeExe = await resolveWindowsNodeExe(workDir);
		await copyFile(nodeExe, OUTPUT_EXE);

		const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";
		run(
			npxBin,
			[
				"--yes",
				`postject@${POSTJECT_VERSION}`,
				OUTPUT_EXE,
				"NODE_SEA_BLOB",
				path.join(workDir, "sea-prep.blob"),
				"--sentinel-fuse",
				NODE_SEA_FUSE,
			],
			{ shell: process.platform === "win32" },
		);

		console.info(`[native-host-sea] ${path.relative(ROOT_DIR, OUTPUT_EXE)}`);
	} finally {
		await rm(workDir, { recursive: true, force: true });
	}
}

await main();
