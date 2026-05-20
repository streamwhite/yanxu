### API surface (semi-auto MVP)

This package is currently split into `@auto-upload/domain` (shared contracts + validators), `@auto-upload/native-host` (Chrome Native Messaging stdin/stdout bridge), and a Chromium extension (`extension/`).

#### Install / toolchain

- Dependencies: install with [`pnpm`](package.json): `pnpm install`
- One-shot builds: [`pnpm build`](package.json)
- Watch mode (recommended while editing): [`pnpm dev`](package.json)
- Lint: [`pnpm lint`](package.json)
- Tests: [`pnpm test`](package.json)

#### Canonical job (`@auto-upload/domain`)

The job file consumed by `applyJobFromFile` is validated by [`CanonicalJobSchema`](packages/domain/src/schema/canonical-job.ts):

- Exported parsing helper: [`validateJob`](packages/domain/src/validation/validate-job.ts)
- Text normalization: [`sanitizeText`](packages/domain/src/text/sanitize-text.ts), [`normalizeCanonicalJobTexts`](packages/domain/src/normalize/normalize-canonical-job-texts.ts)
- Semi-auto guard for the extension MVP: [`assertExtensionSupportedPublishPolicy`](packages/domain/src/publish/assert-extension-supported-publish-policy.ts)

Example job JSON: [`examples/bilibili.job.example.json`](examples/bilibili.job.example.json)

**Job v2 `pageFields`:** each entry has `locator` (`css`, `id`, or `name`) and `value`. Optional `bilibili.title` / `description` / `tags` still map to default Bilibili selectors; `pageFields` are applied in addition. **`bilibili.tags`:** each tag is typed into the tag input and confirmed with **Enter** (not comma-separated).

**`bilibili.sourceType`:** `"original"` → 自制, `"repost"` → 转载 (clicks `.type-check-radio-wrp` `.check-radio-v2-container` by label).

**`bilibili.partition`:** partition label under **分区** (e.g. `"vlog"`); opens `.select-controller` and clicks matching `.select-item-cont`.

**Popup actions:** **1. Upload video first** (`videoOnly` phase) then **2. Fill fields** (`fieldsOnly`, small native reply — avoids message-port timeouts on large videos).

#### Limits / routing constants (`@auto-upload/domain`)

Configured in [`packages/domain/src/constants/limits.ts`](packages/domain/src/constants/limits.ts):

- `DEFAULT_MAX_DIRECT_ATTACH_BYTES`: max video size eligible for chunked base64 transfer to the browser context
- `DEFAULT_MAX_COVER_INLINE_BYTES`: max cover bytes eligible for inline base64 embedding
- `DEFAULT_TRANSFER_CHUNK_BYTES`: host-side base64 chunk sizing for streaming large-but-still-under-cap videos through Native Messaging frames

URLs allowed for content injection checks: [`isAllowedBilibiliMatchUrl`](packages/domain/src/url/is-allowed-bilibili-url.ts)

#### Chrome Native Messaging host (`@auto-upload/native-host`)

- Binary name configured in Chromium manifests: [`NATIVE_HOST_NAME`](packages/domain/src/constants/native-messaging.ts)
- Implemented entrypoint: [`packages/native-host/src/main.ts`](packages/native-host/src/main.ts)
- Message contracts: [`HostInboundMessageSchema`](packages/domain/src/messaging/host-protocol.ts), [`HostOutboundMessageSchema`](packages/domain/src/messaging/host-protocol.ts)

Host install template: [`packages/native-host/dev/com.auto_upload.upload_host.json.template`](packages/native-host/dev/com.auto_upload.upload_host.json.template)

Common OS manifest locations (Chromium family):

- Linux: `~/.config/google-chrome/NativeMessagingHosts/<name>.json` (or the matching config dir for your Chromium-based browser)
- macOS: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/<name>.json`
- Windows: registry + a JSON manifest on disk (see Chromium Native Messaging docs)

Install (recommended on Linux):

```bash
pnpm build
pnpm install:native-host -- --extension-id=<your_id_from_chrome_extensions>
```

Then **fully restart** Chromium.

**Linux note:** Chrome runs the manifest `path` as an **executable**, not `node <file>`. Use the wrapper [`packages/native-host/run-native-host.sh`](packages/native-host/run-native-host.sh) (not `dist/main.js` alone). `pnpm build` / `pnpm install:native-host` set mode `755` on the wrapper.

Manual template [`com.auto_upload.upload_host.json.template`](packages/native-host/dev/com.auto_upload.upload_host.json.template):

- `__AUTO_UPLOAD_NATIVE_HOST_WRAPPER__` → absolute path to `packages/native-host/run-native-host.sh`
- `__EXTENSION_ID__` → extension id from `chrome://extensions` (must match the profile you use)

#### Chromium extension runtime messages

Popup → service worker request:

- Payload shape validated by [`RuntimeApplyJobFromFileMessageSchema`](extension/src/runtime/runtime-message.ts): `{ type: "runtime.applyJobFromFile", jobFilePath: string }`

Host → browser (`applyJobReady.payload`) attachments:

- `attachments.video`:
  - `inlineBase64Chunks`: videos under policy `maxDirectAttachBytes` (default 32 MiB); small files (≤ ~400 KiB) inline in one `applyJobReady`, larger ones via `videoStreamStart` + `videoStreamChunk` frames then assembled in the service worker
  - `manualLargeFile`: videos over `maxDirectAttachBytes`; in-page banner to pick manually or copy the absolute path
- Multi-frame native host replies (stream + final `applyJobReady`) are collected by [`postNativeMessageSession`](extension/src/sw/post-native-message-session.ts)
- `attachments.cover`:
  - `inlineBase64` if small enough for one frame; larger covers use `coverStreamStart` / `coverStreamChunk` (merged in the service worker); over policy max → `skipped`
  - On **Fill fields**, all text/radio/tag/partition fields run first; **cover is last** (brief delay, then modal: `.cover-img` → `.upload-area` → `input[type=file]`). Close the modal manually after review.

Service worker → content script:

- [`ContentMessageType.ApplyJob`](extension/src/content/content-message-type.ts): `{ type: "content.applyJob", payload: AppliedJobPayload }`

#### Dev workspace (watch + debug from the repo)

Chromium **does not** auto-reload unpacked extensions when `extension/dist/*` changes. You still **reload once per successful rebuild** (fast: pin `chrome://extensions` or use a reloader shortcut). You **do not** re-“Load unpacked” every time.

- **Watch everything:** [`pnpm dev`](package.json) runs three concurrent watchers:
  - `tsc --watch` → [`packages/domain`](packages/domain) `dist/`
  - `tsc --watch` → [`packages/native-host`](packages/native-host) `dist/`
  - [`esbuild --watch`](scripts/build-extension.mjs) → [`extension/dist`](extension/dist) (prints a line when a rebuild finishes)
- **Editor integration:** [.vscode/tasks.json](.vscode/tasks.json) — default build task runs `pnpm dev` in a dedicated terminal. [.vscode/launch.json](.vscode/launch.json) — **Chrome: Bilibili + load extension** launches Chromium with `--load-extension=${workspaceFolder}/extension` and a **persistent** `userDataDir` under [`.vscode/chrome-profile-dev`](.vscode/launch.json) so the unpacked **extension ID stays stable** for Native Messaging (register `allowed_origins` once against that ID).
- **Inspect:** MV3 **service worker** → Extensions → your extension → “Service worker” → _inspect_. **Popup** → extension icon popup → inspect. **Content script** → normal page DevTools on the Bilibli tab.

**“Message port closed” / long-running popup actions**

- Run `pnpm build`, then **Reload** the extension on `chrome://extensions`.
- The service worker **acks immediately**; the real result is read from **`chrome.storage.local`** (do not treat DevTools “message port closed” as the final outcome).
- **Upload video first**: files **> ~400 KiB** and **≤ policy max** (default 32 MiB) stream as chunked native messages and attach silently; files **> max** show the manual banner.
- **`Receiving end does not exist`**: focus the **Bilibili upload tab**, **refresh** it after reloading the extension, then retry. The extension will inject the content script automatically if needed.

#### Build outputs

- Workspace build: [`pnpm build`](package.json) builds `@auto-upload/domain`, `@auto-upload/native-host`, and bundles `extension/dist/*` via [`scripts/build-extension.mjs`](scripts/build-extension.mjs)
- Load unpacked: select the [`extension`](extension/manifest.json) directory (after `pnpm build`)
