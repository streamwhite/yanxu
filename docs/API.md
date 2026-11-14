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

Example job JSON (extension popup):

- Batch (multi-tab, **required**): [`examples/batch.job.example.json`](examples/batch.job.example.json)

Legacy v1/v2 single-platform examples remain for native-host / schema reference only: `examples/bilibili.job.example.json`, `examples/douyin.job.example.json`, `examples/channels.job.example.json`.

**Job v2 `platform`:** `bilibili` | `douyin` | `channels`. `targets[0]` must match `platform`. Platform block (`bilibili`, `douyin`, `channels`) supplies default page fields; `pageFields` adds custom locators.

**Job v3 batch:** `jobVersion: 3`, `assetsParentFolder` (absolute), `items[]` with **`name`** (title + file stem: `{name}.mp4`, optional `{name}.png` / `.jpg` / `.jpeg`). Optional `publish` (defaults to `{ mode: "semi", submit: "manual" }`), `targets` (defaults to all three: `bilibili`, `douyin`, `channels`), `includeCover: false` (disable cover) or `true` (require cover), `description` (falls back to `name` only when omitted; an empty string leaves it blank), and Bilibili `tags` / `sourceType` / `partition` / `creativeStatement` / `creativeStatementAuth`. Use the popup **打开全部上传标签页** / **上传并填充（全部标签页）** actions.

**One tab per job item per platform:** count how many `items[]` list a platform in `targets` — that is how many upload tabs you need for that platform. Example with 2 items where both include `douyin`: open **2 Douyin upload tabs**; tab with the lower tab id gets item 0’s video, the next tab gets item 1’s video. Platforms with only one matching item need one tab. Upload-page URLs are preferred; among ties, lower tab id wins.

**All-tab actions preflight every platform (bilibili, douyin, channels / 视频号); if any platform is short, nothing is uploaded.** Before **Upload video (all tabs)** or **Fill fields (all tabs)**, the native host runs `checkBatchJobAssetsFromFile`: every item must have `{name}.mp4` on disk. Covers are optional by default: an existing cover is used, but absence is allowed. Set `includeCover: true` to require one; `includeCover: false` disables it. Missing required assets return `batch_assets_missing` (all listed) and **no tab is updated**.

**Job v2 `pageFields`:** each entry has `locator` (`css`, `id`, or `name`) and `value`. Optional `bilibili.title` / `description` / `tags` still map to default Bilibili selectors; `pageFields` are applied in addition. **`bilibili.tags`:** each tag is typed into the tag input and confirmed with **Enter** (not comma-separated).

**`bilibili.sourceType`:** `"original"` → 自制, `"repost"` → 转载 (clicks `.type-check-radio-wrp` `.check-radio-v2-container` by label).

**`bilibili.partition`:** partition label under **分区** (e.g. `"vlog"`); opens `.select-controller` and clicks matching `.select-item-cont`.

**`bilibili.creativeStatement` / `bilibili.creativeStatementAuth`:** optional; default to **内容无需标注** and **内容为自制：未经作者允许，禁止转载** (`.statement-content .bcc-select` dropdown). Omitted from batch JSON when defaults apply.

**Popup actions (batch only):** Click the toolbar icon to open a **persistent control window** (stays open until you close it). **打开全部上传标签页** opens one tab per job item for each targeted platform (`bilibili`, `douyin`, `视频号`; canonical upload URLs in [`PLATFORM_UPLOAD_PAGE_URLS`](packages/domain/src/constants/platform-upload-page-urls.ts)). **上传并填充（全部标签页）** runs `videoOnly`, waits **`fieldsSettleMs`** (default 4000, configurable on the extension **options page**, stored in `semiAutoFieldsSettleMs`), then `fieldsOnly` — platforms run in parallel; within each platform, items run in parallel with a random **1–3 s** stagger (视频号 / `channels` runs **sequentially** and activates each tab before upload/fill). Progress logs use short field names (e.g. `描述`, `标题`) instead of CSS selectors. Legacy runtime messages `runtime.uploadAllTabs` / `runtime.fillAllTabs` / `runtime.openPlatformTabs` remain for automation; use `runtime.openAllPlatformTabs` to open every platform at once. Non-batch job files return `batch_job_required`.

**Host `inspectJobFromFile`:** returns `jobFileOutline` with `items[].itemIndex` and `targets` (no file attachments). **`applyBatchItemFromFile`** requires `itemIndex` + `platform` (including `0`) to project one batch item to v2 before attach. Tab _n_ (by tab id among upload URLs) maps to the *n*th item index for that platform.

#### Limits / routing constants (`@auto-upload/domain`)

Configured in [`packages/domain/src/constants/limits.ts`](packages/domain/src/constants/limits.ts):

- `DEFAULT_MAX_DIRECT_ATTACH_BYTES`: max video size eligible for chunked base64 transfer to the browser context
- `DEFAULT_MAX_COVER_INLINE_BYTES`: max cover bytes eligible for inline base64 embedding
- `DEFAULT_TRANSFER_CHUNK_BYTES`: host-side base64 chunk sizing for streaming large-but-still-under-cap videos through Native Messaging frames

URLs allowed for content injection: [`isAllowedPlatformUrl`](packages/domain/src/url/is-allowed-platform-url.ts), [`detectPlatformFromUrl`](packages/domain/src/url/detect-platform-from-url.ts). Bilibili helper: [`isAllowedBilibiliMatchUrl`](packages/domain/src/url/is-allowed-bilibili-url.ts).

#### Chrome Native Messaging host (`@auto-upload/native-host`)

- Binary name configured in Chromium manifests: [`NATIVE_HOST_NAME`](packages/domain/src/constants/native-messaging.ts)
- Implemented entrypoint: [`packages/native-host/src/main.ts`](packages/native-host/src/main.ts)
- Message contracts: [`HostInboundMessageSchema`](packages/domain/src/messaging/host-protocol.ts), [`HostOutboundMessageSchema`](packages/domain/src/messaging/host-protocol.ts)

Host install template: [`packages/native-host/dev/com.auto_upload.upload_host.json.template`](packages/native-host/dev/com.auto_upload.upload_host.json.template)

Common OS manifest locations (Chromium family):

- Linux: `~/.config/google-chrome/NativeMessagingHosts/<name>.json` (or the matching config dir for your Chromium-based browser)
- macOS: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/<name>.json`
- Windows: registry + a JSON manifest on disk (see Chromium Native Messaging docs)

One-shot host setup (install, build, native manifest):

```bash
./scripts/setup-host.sh <your_id_from_chrome_extensions>
```

Or manually:

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

Popup → service worker (batch only):

- [`RuntimeUploadAllTabsMessageSchema`](extension/src/runtime/runtime-message.ts): `{ type: "runtime.uploadAllTabs", jobFilePath: string }`
- [`RuntimeFillAllTabsMessageSchema`](extension/src/runtime/runtime-message.ts): `{ type: "runtime.fillAllTabs", jobFilePath: string }`

Host → browser (`applyJobReady.payload`) attachments:

- `attachments.video`:
  - `inlineBase64Chunks`: videos under policy `maxDirectAttachBytes` (default 32 MiB); small files (≤ ~400 KiB) inline in one `applyJobReady`, larger ones via `videoStreamStart` + `videoStreamChunk` frames then assembled in the service worker
  - `manualLargeFile`: videos over `maxDirectAttachBytes`; in-page banner to pick manually or copy the absolute path
- Multi-frame native host replies (stream + final `applyJobReady`) are collected by [`postNativeMessageSession`](extension/src/sw/post-native-message-session.ts)
- `attachments.cover`:
  - `inlineBase64` if small enough for one frame; larger covers use `coverStreamStart` / `coverStreamChunk` (merged in the service worker); over policy max → `skipped`
  - On **Fill fields**, all text/radio/tag/partition fields run first; **cover is last** on platforms with cover UI (bilibili: poll until cover trigger ready, then `.cover-img` → `.upload-area` → `input[type=file]`). Close the modal manually after review.

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

## fields

### bili

{
"creativeStatement": "含AI生成内容",
"creativeStatementAuth": "内容为自制：未经作者允许，禁止转载"
}
