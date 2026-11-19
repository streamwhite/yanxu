import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");
const NATIVE_HOST_DIR = path.join(ROOT_DIR, "packages/native-host");
const DOMAIN_INDEX = path.join(ROOT_DIR, "packages/domain/src/index.ts");

const result = await esbuild.build({
	entryPoints: [path.join(NATIVE_HOST_DIR, "src/main.ts")],
	outfile: path.join(NATIVE_HOST_DIR, "dist/main.js"),
	bundle: true,
	platform: "node",
	format: "esm",
	target: ["node20"],
	sourcemap: true,
	// Bundle the workspace package so npm-only installs do not need a workspace link.
	alias: { "@yanxu/domain": DOMAIN_INDEX },
	logLevel: "info",
});

if (result.errors.length > 0) {
	process.exit(1);
}
