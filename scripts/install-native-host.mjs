import { access, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NATIVE_HOST_NAME = "com.yanxu.upload_host";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");

const HOST_WRAPPER = path.join(ROOT_DIR, "packages/native-host/run-native-host.sh");

const CHROME_CONFIG_DIR_CANDIDATES = [
	path.join(os.homedir(), ".config", "google-chrome"),
	path.join(os.homedir(), ".config", "chromium"),
	path.join(os.homedir(), ".config", "BraveSoftware", "Brave-Browser"),
	path.join(os.homedir(), ".config", "microsoft-edge"),
];

function parseExtensionId(argv) {
	const flag = argv.find((arg) => arg.startsWith("--extension-id="));
	if (flag) return flag.slice("--extension-id=".length).trim();
	const index = argv.indexOf("--extension-id");
	if (index >= 0 && argv[index + 1]) return argv[index + 1].trim();
	return process.env.YANXU_EXTENSION_ID?.trim() ?? "";
}

async function resolveChromeConfigDir() {
	const fromEnv = process.env.YANXU_CHROME_CONFIG_DIR?.trim();
	if (fromEnv) return fromEnv;

	for (const candidate of CHROME_CONFIG_DIR_CANDIDATES) {
		try {
			await access(candidate);
			return candidate;
		} catch {
			//
		}
	}

	return CHROME_CONFIG_DIR_CANDIDATES[0];
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

	await import("./ensure-native-host-executable.mjs");

	const chromeConfigDir = await resolveChromeConfigDir();
	const hostsDir = path.join(chromeConfigDir, "NativeMessagingHosts");
	await mkdir(hostsDir, { recursive: true });

	const manifestPath = path.join(hostsDir, `${NATIVE_HOST_NAME}.json`);
	const manifest = {
		name: NATIVE_HOST_NAME,
		description: "Yanxu multi-platform creator submission native host",
		path: HOST_WRAPPER,
		type: "stdio",
		allowed_origins: [`chrome-extension://${extensionId}/`],
	};

	await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

	console.info(`Wrote ${manifestPath}`);
	console.info(`Host launcher: ${HOST_WRAPPER}`);
	console.info("Restart Chromium completely, then try the extension popup again.");
}

void main();
