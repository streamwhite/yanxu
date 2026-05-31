import esbuild from "esbuild";
import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.join(fileURLToPath(new URL(".", import.meta.url)), "..");

const requireFromDomain = createRequire(path.join(ROOT_DIR, "packages/domain/package.json"));
const ZOD_ENTRY = requireFromDomain.resolve("zod");

const ENTRY_SW = path.join(ROOT_DIR, "extension/src/sw.ts");
const ENTRY_POPUP = path.join(ROOT_DIR, "extension/src/popup/popup.ts");
const ENTRY_CONTENT = path.join(ROOT_DIR, "extension/src/content/platform-fill.ts");

const OUT_DIR = path.join(ROOT_DIR, "extension/dist");
const DOMAIN_INDEX = path.join(ROOT_DIR, "packages/domain/src/index.ts");
const BOOTSTRAP_CSS_SRC = path.join(ROOT_DIR, "assets/bootstrap-5.3.8/css/bootstrap.min.css");
const BOOTSTRAP_CSS_DEST_DIR = path.join(OUT_DIR, "vendor/bootstrap");
const BOOTSTRAP_CSS_DEST = path.join(BOOTSTRAP_CSS_DEST_DIR, "bootstrap.min.css");

const WATCH_FLAG = "--watch";
const watchMode = process.argv.includes(WATCH_FLAG);

const EXTENSION_LOG_PREFIX = "[extension]";

const basePlugins = [
	{
		name: "resolve-zod-from-domain-package",
		setup(build) {
			build.onResolve({ filter: /^zod$/ }, () => ({ path: ZOD_ENTRY }));
		},
	},
	{
		name: "@auto-upload/domain-alias",
		setup(build) {
			build.onResolve({ filter: /^@auto-upload\/domain$/ }, () => ({ path: DOMAIN_INDEX }));
		},
	},
];

const rebuildLogPlugin = {
	name: "log-rebuild",
	setup(build) {
		build.onEnd((result) => {
			const errorCount = result.errors.length;
			const warningCount = result.warnings.length;
			if (errorCount > 0) {
				console.error(
					`${EXTENSION_LOG_PREFIX} build failed (${String(errorCount)} errors, ${String(warningCount)} warnings)`,
				);
				return;
			}
			console.info(
				`${EXTENSION_LOG_PREFIX} rebuilt — click Reload on chrome://extensions (or your reloader shortcut)`,
			);
		});
	},
};

async function copyBootstrapForPopup() {
	await mkdir(BOOTSTRAP_CSS_DEST_DIR, { recursive: true });
	await cp(BOOTSTRAP_CSS_SRC, BOOTSTRAP_CSS_DEST);
}

function createSharedOptions() {
	return {
		entryPoints: {
			sw: ENTRY_SW,
			popup: ENTRY_POPUP,
			"content-platform-fill": ENTRY_CONTENT,
		},
		outdir: OUT_DIR,
		bundle: true,
		format: "esm",
		platform: "browser",
		target: ["chrome126"],
		sourcemap: true,
	};
}

let bootstrapCopied = false;

async function ensureBootstrapForPopup() {
	if (bootstrapCopied && watchMode) return;
	await copyBootstrapForPopup();
	bootstrapCopied = true;
}

await ensureBootstrapForPopup();

if (watchMode) {
	const ctx = await esbuild.context({
		...createSharedOptions(),
		logLevel: "info",
		plugins: [...basePlugins, rebuildLogPlugin],
	});
	await ctx.watch();
	console.info(`${EXTENSION_LOG_PREFIX} esbuild watch → ${OUT_DIR}`);
} else {
	await esbuild.build({
		...createSharedOptions(),
		plugins: basePlugins,
	});
}
