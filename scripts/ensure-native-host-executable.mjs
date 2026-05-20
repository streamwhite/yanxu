import { chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");

const WRAPPER_SH = path.join(ROOT_DIR, "packages/native-host/run-native-host.sh");
const MAIN_JS = path.join(ROOT_DIR, "packages/native-host/dist/main.js");

const EXECUTABLE_MODE = 0o755;

await chmod(WRAPPER_SH, EXECUTABLE_MODE);
try {
	await chmod(MAIN_JS, EXECUTABLE_MODE);
} catch {
	// dist/main.js may not exist before first build
}
