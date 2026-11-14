#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

EXTENSION_ID="${1:-${YANXU_EXTENSION_ID:-}}"

if [[ -z "${EXTENSION_ID}" ]]; then
	echo "Usage: ./scripts/setup-host.sh <extension-id-from-chrome://extensions>"
	echo "   or: YANXU_EXTENSION_ID=<id> ./scripts/setup-host.sh"
	exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
	echo "pnpm is required. Install Node.js and pnpm first."
	exit 1
fi

echo "[setup-host] installing dependencies…"
pnpm install

echo "[setup-host] building domain, native-host, and extension…"
pnpm build

echo "[setup-host] installing native messaging manifest…"
pnpm install:native-host -- --extension-id="${EXTENSION_ID}"

echo "[setup-host] done."
echo "Load extension/dist as unpacked in Chromium, then fully restart the browser."
echo "Click the extension icon to open the control window (stays open until you close it)."
