import { spawnSync } from "node:child_process";
import { access, chmod, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const NATIVE_HOST_NAME = "com.yanxu.upload_host";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const NATIVE_HOST_DIR = path.join(ROOT_DIR, "packages/native-host");
const MAIN_JS = path.join(NATIVE_HOST_DIR, "dist/main.js");
const RUNTIME_DIR = path.join(NATIVE_HOST_DIR, ".runtime");

const IS_WINDOWS = process.platform === "win32";
const IS_MACOS = process.platform === "darwin";

/** Chromium-family config directories relative to the user home directory. */
const LINUX_BROWSER_CONFIG_DIRS = [
	".config/google-chrome",
	".config/google-chrome-beta",
	".config/google-chrome-unstable",
	".config/chromium",
	".config/BraveSoftware/Brave-Browser",
	".config/microsoft-edge",
	".config/microsoft-edge-beta",
	".config/microsoft-edge-dev",
	".config/vivaldi",
	// Snap and Flatpak keep separate profiles.
	"snap/chromium/common/chromium",
	".var/app/org.chromium.Chromium/config/chromium",
	".var/app/com.google.Chrome/config/google-chrome",
	".var/app/com.brave.Browser/config/BraveSoftware/Brave-Browser",
	".var/app/com.microsoft.Edge/config/microsoft-edge",
];

const MACOS_BROWSER_CONFIG_DIRS = [
	"Library/Application Support/Google/Chrome",
	"Library/Application Support/Google/Chrome Beta",
	"Library/Application Support/Google/Chrome Dev",
	"Library/Application Support/Google/Chrome Canary",
	"Library/Application Support/Chromium",
	"Library/Application Support/BraveSoftware/Brave-Browser",
	"Library/Application Support/Microsoft Edge",
	"Library/Application Support/Microsoft Edge Beta",
	"Library/Application Support/Microsoft Edge Dev",
	"Library/Application Support/Vivaldi",
];

/** Windows Chromium browsers read the host location from these registry keys. */
const WINDOWS_REGISTRY_ROOTS = [
	"Software\\Google\\Chrome\\NativeMessagingHosts",
	"Software\\Chromium\\NativeMessagingHosts",
	"Software\\Microsoft\\Edge\\NativeMessagingHosts",
	"Software\\BraveSoftware\\Brave-Browser\\NativeMessagingHosts",
	"Software\\Vivaldi\\NativeMessagingHosts",
];

function parseExtensionId(argv) {
	const flag = argv.find((arg) => arg.startsWith("--extension-id="));
	if (flag) return flag.slice("--extension-id=".length).trim();
	const index = argv.indexOf("--extension-id");
	if (index >= 0 && argv[index + 1]) return argv[index + 1].trim();
	return process.env.YANXU_EXTENSION_ID?.trim() ?? "";
}

async function pathExists(target) {
	try {
		await access(target);
		return true;
	} catch {
		return false;
	}
}

/** Quote a path for POSIX sh, including embedded single quotes. */
function quoteForPosixShell(value) {
	return `'${value.replaceAll("'", "'\\''")}'`;
}

/**
 * Chrome launches the manifest `path` directly and does not inherit the shell
 * PATH, so bake Node's absolute path into a per-install launcher.
 */
async function writeLauncher() {
	await mkdir(RUNTIME_DIR, { recursive: true });

	if (IS_WINDOWS) {
		const launcherPath = path.join(RUNTIME_DIR, "run-native-host.cmd");
		const content = `@echo off\r\n"${process.execPath}" "${MAIN_JS}" %*\r\n`;
		await writeFile(launcherPath, content, "utf8");
		return launcherPath;
	}

	const launcherPath = path.join(RUNTIME_DIR, "run-native-host.sh");
	const content = [
		"#!/usr/bin/env bash",
		"set -euo pipefail",
		`exec ${quoteForPosixShell(process.execPath)} ${quoteForPosixShell(MAIN_JS)} "$@"`,
		"",
	].join("\n");
	await writeFile(launcherPath, content, "utf8");
	await chmod(launcherPath, 0o755);
	return launcherPath;
}

function buildManifest(extensionId, launcherPath) {
	return {
		name: NATIVE_HOST_NAME,
		description: "Yanxu multi-platform creator submission native host",
		path: launcherPath,
		type: "stdio",
		allowed_origins: [`chrome-extension://${extensionId}/`],
	};
}

async function writeManifest(hostsDir, manifest) {
	await mkdir(hostsDir, { recursive: true });
	const manifestPath = path.join(hostsDir, `${NATIVE_HOST_NAME}.json`);
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
	return manifestPath;
}

async function existingDirectories(candidates) {
	const existing = [];
	for (const candidate of candidates) {
		if (await pathExists(candidate)) existing.push(candidate);
	}
	return existing;
}

function candidateLinuxDirectories() {
	const override = process.env.YANXU_CHROME_CONFIG_DIR?.trim();
	if (override) return [override];
	return LINUX_BROWSER_CONFIG_DIRS.map((dir) => path.join(os.homedir(), dir));
}

function candidateMacosDirectories() {
	const override = process.env.YANXU_CHROME_CONFIG_DIR?.trim();
	if (override) return [override];
	return MACOS_BROWSER_CONFIG_DIRS.map((dir) => path.join(os.homedir(), dir));
}

async function installPosixManifests(manifest, candidates, fallback) {
	// An explicit config dir must be used even before it exists.
	const targetDirs = process.env.YANXU_CHROME_CONFIG_DIR?.trim()
		? candidates
		: await existingDirectories(candidates);
	const dirs = targetDirs.length > 0 ? targetDirs : [fallback];

	const written = [];
	for (const configDir of dirs) {
		const manifestPath = await writeManifest(
			path.join(configDir, "NativeMessagingHosts"),
			manifest,
		);
		written.push(manifestPath);
	}
	return written;
}

function registerWindowsHost(manifestPath) {
	for (const registryRoot of WINDOWS_REGISTRY_ROOTS) {
		const key = `HKCU\\${registryRoot}\\${NATIVE_HOST_NAME}`;
		const result = spawnSync("reg", ["add", key, "/ve", "/t", "REG_SZ", "/d", manifestPath, "/f"], {
			stdio: "inherit",
		});
		if (result.error) {
			console.warn(`[install-native-host] cannot run reg.exe: ${result.error.message}`);
			return;
		}
		if (result.status !== 0) {
			console.warn(`[install-native-host] failed to register ${key}`);
		}
	}
}

async function installWindowsManifest(manifest) {
	const localAppData =
		process.env.LOCALAPPDATA?.trim() ?? path.join(os.homedir(), "AppData", "Local");
	const hostsDir = path.join(localAppData, "Yanxu", "NativeMessagingHosts");
	const manifestPath = await writeManifest(hostsDir, manifest);
	registerWindowsHost(manifestPath);
	return [manifestPath];
}

async function main() {
	const extensionId = parseExtensionId(process.argv.slice(2));
	if (!extensionId) {
		console.error(
			"Usage: pnpm install:native-host -- --extension-id=<id from chrome://extensions>\n" +
				"   or: YANXU_EXTENSION_ID=<id> pnpm install:native-host",
		);
		process.exit(1);
	}

	if (!(await pathExists(MAIN_JS))) {
		console.error(
			`[install-native-host] ${MAIN_JS} is missing. Run "pnpm build" before installing the host.`,
		);
		process.exit(1);
	}

	const launcherPath = await writeLauncher();
	const manifest = buildManifest(extensionId, launcherPath);

	let manifestPaths;
	if (IS_WINDOWS) {
		manifestPaths = await installWindowsManifest(manifest);
	} else if (IS_MACOS) {
		manifestPaths = await installPosixManifests(
			manifest,
			candidateMacosDirectories(),
			path.join(os.homedir(), MACOS_BROWSER_CONFIG_DIRS[0]),
		);
	} else {
		manifestPaths = await installPosixManifests(
			manifest,
			candidateLinuxDirectories(),
			path.join(os.homedir(), LINUX_BROWSER_CONFIG_DIRS[0]),
		);
	}

	console.info(`[install-native-host] launcher: ${launcherPath}`);
	for (const manifestPath of manifestPaths) {
		console.info(`[install-native-host] manifest: ${manifestPath}`);
	}
	if (IS_WINDOWS) {
		console.info("[install-native-host] registry: HKCU Chromium-family NativeMessagingHosts keys");
	}
	console.info(
		"[install-native-host] fully quit and restart the browser (check tray/menu bar), then try again.",
	);
	console.info(
		"[install-native-host] if you move the repository or change Node versions, rerun this command.",
	);
}

void main();
