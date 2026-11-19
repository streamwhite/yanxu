import { spawnSync } from "node:child_process";
import { cp, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SKIPPED_PATTERNS, ZIP_ENTRIES } from "./package-extension.mjs";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const EXTENSION_DIR = path.join(ROOT_DIR, "extension");
const OUT_DIR = path.join(ROOT_DIR, "packages-out");
const HOST_EXE = path.join(OUT_DIR, "yanxu-native-host-win-x64.exe");
const INSTALL_SCRIPT = path.join(ROOT_DIR, "scripts/setup-host-windows.ps1");

function shouldCopyExtensionFile(source) {
	const relativePath = path.relative(EXTENSION_DIR, source).split(path.sep).join("/");
	if (relativePath === "") return true;
	if (SKIPPED_PATTERNS.some((pattern) => matchPattern(relativePath, pattern))) return false;
	return true;
}

function matchPattern(relativePath, pattern) {
	if (!pattern.includes("*")) return relativePath === pattern;
	const escaped = pattern.replaceAll(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
	return new RegExp(`^${escaped}$`).test(relativePath);
}

async function readVersion() {
	const manifest = JSON.parse(await readFile(path.join(EXTENSION_DIR, "manifest.json"), "utf8"));
	if (typeof manifest.version !== "string" || manifest.version.length === 0) {
		throw new Error("extension/manifest.json is missing a version");
	}
	return manifest.version;
}

function createZip(archivePath, stagingDir) {
	const result = spawnSync("zip", ["-r", "-X", "-q", archivePath, "."], {
		cwd: stagingDir,
		stdio: "inherit",
	});
	if (result.error) {
		throw new Error(`failed to run zip: ${result.error.message}`);
	}
	if (result.status !== 0) {
		throw new Error(`zip exited with status ${String(result.status)}`);
	}
}

async function main() {
	const version = await readVersion();
	const stagingDir = path.join(OUT_DIR, `yanxu-windows-${version}`);
	const archivePath = path.join(OUT_DIR, `yanxu-windows-${version}.zip`);

	await rm(stagingDir, { recursive: true, force: true });
	await rm(archivePath, { force: true });
	await mkdir(stagingDir, { recursive: true });

	for (const entry of ZIP_ENTRIES) {
		await cp(path.join(EXTENSION_DIR, entry), path.join(stagingDir, "extension", entry), {
			recursive: true,
			filter: shouldCopyExtensionFile,
		});
	}
	for (const doc of ["LICENSE", "NOTICE"]) {
		await copyFile(path.join(ROOT_DIR, doc), path.join(stagingDir, doc));
	}

	await copyFile(HOST_EXE, path.join(stagingDir, "yanxu-native-host.exe"));
	await copyFile(INSTALL_SCRIPT, path.join(stagingDir, "install-windows.ps1"));
	await writeFile(
		path.join(stagingDir, "使用说明.txt"),
		[
			"雁序 Windows 安装",
			"",
			"1. 在 Chrome / Edge 打开 chrome://extensions 或 edge://extensions，开启开发者模式。",
			"2. 选择“加载已解压的扩展程序”，加载本目录下的 extension 文件夹。",
			"3. 复制扩展 ID。",
			"4. 在本目录打开 PowerShell，执行：",
			"   powershell -ExecutionPolicy Bypass -File .\\install-windows.ps1 <扩展ID>",
			"5. 完全退出并重新启动浏览器。",
			"",
		].join("\r\n"),
		"utf8",
	);

	createZip(archivePath, stagingDir);
	console.info(`[package-windows] ${path.relative(ROOT_DIR, archivePath)}`);
}

void main();
