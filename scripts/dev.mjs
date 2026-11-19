import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const EXTENSION_BUILD_SCRIPT = path.join(ROOT_DIR, "scripts/build-extension.mjs");

const children = [];

function run(label, command, args) {
	const child = spawn(command, args, {
		cwd: ROOT_DIR,
		stdio: "inherit",
		env: { ...process.env },
	});

	children.push({ label, child });

	child.on("exit", (code, signal) => {
		if (signal) return;
		if (code !== 0) {
			console.error(`[dev] ${label} exited with code ${String(code)}`);
			shutdown(code ?? 1);
		}
	});
}

function shutdown(exitCode = 0) {
	for (const { child } of children) {
		if (!child.killed) child.kill("SIGTERM");
	}
	setTimeout(() => process.exit(exitCode), 100);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.info("[dev] watch: packages/domain + extension/esbuild");
console.info("[dev] Reload the unpacked extension once per rebuild (see docs/API.md)");

run("domain", "pnpm", [
	"exec",
	"tsc",
	"-p",
	"packages/domain/tsconfig.build.json",
	"--watch",
	"--preserveWatchOutput",
]);

run("extension", process.execPath, [EXTENSION_BUILD_SCRIPT, "--watch"]);
