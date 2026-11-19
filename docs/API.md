### API surface (semi-auto MVP)

This package is currently split into `@yanxu/domain` (shared contracts + validators) and a Chromium extension (`extension/`).

#### Install / toolchain

- Dependencies: install with [`pnpm`](package.json): `pnpm install`
- One-shot builds: [`pnpm build`](package.json)
- Watch mode (recommended while editing): [`pnpm dev`](package.json)
- Lint: [`pnpm lint`](package.json)
- Tests: [`pnpm test`](package.json)

#### Canonical job (`@yanxu/domain`)

The job file consumed by `applyJobFromFile` is validated by [`CanonicalJobSchema`](packages/domain/src/schema/canonical-job.ts):

- Exported parsing helper: [`validateJob`](packages/domain/src/validation/validate-job.ts)
- Text normalization: [`sanitizeText`](packages/domain/src/text/sanitize-text.ts), [`normalizeCanonicalJobTexts`](packages/domain/src/normalize/normalize-canonical-job-texts.ts)
- Semi-auto guard for the extension MVP: [`assertExtensionSupportedPublishPolicy`](packages/domain/src/publish/assert-extension-supported-publish-policy.ts)

Example job file:

- Batch JSON (multi-tab): [`examples/batch.job.example.json`](examples/batch.job.example.json)
- Batch CSV (Excel-friendly): [`examples/batch.job.example.csv`](examples/batch.job.example.csv)
- Batch XLSX: select any `.xlsx` job file; the first worksheet is used. CSV/XLSX are converted to the same batch job structure, and assets are resolved from the selected directory by file name.

Legacy v1/v2 single-platform examples remain for schema reference only: `examples/bilibili.job.example.json`, `examples/douyin.job.example.json`, `examples/channels.job.example.json`.

**Job v2 `platform`:** `bilibili` | `douyin` | `channels`. `targets[0]` must match `platform`. Platform block (`bilibili`, `douyin`, `channels`) supplies default page fields; `pageFields` adds custom locators.

**Job v3 batch:** `jobVersion: 3`, `assetsParentFolder` (absolute), `items[]` with **`name`** (title + file stem: `{name}.mp4`, optional `{name}.png` / `.jpg` / `.jpeg`). Optional `publish` (defaults to `{ mode: "semi", submit: "manual" }`), `targets` (defaults to all three: `bilibili`, `douyin`, `channels`), `includeCover: false` (disable cover) or `true` (require cover), `description` (falls back to `name` only when omitted; an empty string leaves it blank), and Bilibili `tags` / `sourceType` / `partition` / `creativeStatement` / `creativeStatementAuth`. Use the popup **打开全部上传标签页** / **上传并填充（全部标签页）** actions.

**One tab per job item per platform:** count how many `items[]` list a platform in `targets` — that is how many upload tabs you need for that platform. Example with 2 items where both include `douyin`: open **2 Douyin upload tabs**; tab with the lower tab id gets item 0’s video, the next tab gets item 1’s video. Platforms with only one matching item need one tab. Upload-page URLs are preferred; among ties, lower tab id wins.

**All-tab actions preflight every platform (bilibili, douyin, channels / 视频号); if any platform is short, nothing is uploaded.** Before **Upload video (all tabs)** or **Fill fields (all tabs)**, the extension runs `checkBatchJobAssetsFromFile`: every item must have `{name}.mp4` in the selected assets directory. Covers are optional by default: an existing cover is used, but absence is allowed. Set `includeCover: true` to require one; `includeCover: false` disables it. Missing required assets return `batch_assets_missing` (all listed) and **no tab is updated**.

**Job v2 `pageFields`:** each entry has `locator` (`css`, `id`, or `name`) and `value`. Optional `bilibili.title` / `description` / `tags` still map to default Bilibili selectors; `pageFields` are applied in addition. **`bilibili.tags`:** each tag is typed into the tag input and confirmed with **Enter** (not comma-separated).

**`bilibili.sourceType`:** `"original"` → 自制, `"repost"` → 转载 (clicks `.type-check-radio-wrp` `.check-radio-v2-container` by label).

**`bilibili.partition`:** partition label under **分区** (e.g. `"vlog"`); opens `.select-controller` and clicks matching `.select-item-cont`.

**`bilibili.creativeStatement` / `bilibili.creativeStatementAuth`:** optional; default to **内容无需标注** and **内容为自制：未经作者允许，禁止转载** (`.statement-content .bcc-select` dropdown). Omitted from batch JSON when defaults apply.

**Popup actions (batch only):** Click the toolbar icon to open a **persistent control window** (stays open until you close it). **开始** first opens one upload tab per job item for each targeted platform (`bilibili`, `douyin`, `视频号`; canonical upload URLs in [`PLATFORM_UPLOAD_PAGE_URLS`](packages/domain/src/constants/platform-upload-page-urls.ts)), then runs `videoOnly`, waits **`fieldsSettleMs`** (default 4000, configurable on the extension **options page**, stored in `semiAutoFieldsSettleMs`), then `fieldsOnly`. Video attachments use the upload pacing below; fields are applied after the settle interval, with 视频号 / `channels` processed sequentially and its tab activated before each action. Progress logs use short field names (e.g. `描述`, `标题`) instead of CSS selectors. Legacy runtime messages `runtime.uploadAllTabs` / `runtime.fillAllTabs` / `runtime.openPlatformTabs` remain for automation; use `runtime.openAllPlatformTabs` to open every platform at once. Non-batch job files return `batch_job_required`.

**Upload pacing:** Each platform is limited to **30 upload starts in a rolling 24-hour window**. Reaching that limit stops remaining uploads for that platform and reports when it can resume; other platforms are unaffected. The rate history is stored locally and survives browser restarts.

**Host `inspectJobFromFile`:** returns `jobFileOutline` with `items[].itemIndex` and `targets` (no file attachments). **`applyBatchItemFromFile`** requires `itemIndex` + `platform` (including `0`) to project one batch item to v2 before attach. Tab _n_ (by tab id among upload URLs) maps to the *n*th item index for that platform.

#### Limits / routing constants (`@yanxu/domain`)

Configured in [`packages/domain/src/constants/limits.ts`](packages/domain/src/constants/limits.ts):

- `DEFAULT_MAX_DIRECT_ATTACH_BYTES`: max video size eligible for chunked base64 transfer to the browser context
- `DEFAULT_MAX_COVER_INLINE_BYTES`: max cover bytes eligible for inline base64 embedding
- `DEFAULT_TRANSFER_CHUNK_BYTES`: base64 chunk sizing for streaming large-but-still-under-cap videos through extension messages

URLs allowed for content injection: [`isAllowedPlatformUrl`](packages/domain/src/url/is-allowed-platform-url.ts), [`detectPlatformFromUrl`](packages/domain/src/url/detect-platform-from-url.ts). Bilibili helper: [`isAllowedBilibiliMatchUrl`](packages/domain/src/url/is-allowed-bilibili-url.ts).

#### Browser file source (default)

The extension can read the job file and assets directly through the File System Access API, without a native host:

- Handle storage and permission checks: [`extension/src/shared/browser-file-source.ts`](extension/src/shared/browser-file-source.ts)
- JSON / CSV / XLSX job parsing: [`extension/src/shared/parse-job-file.ts`](extension/src/shared/parse-job-file.ts)
- Browser-side host protocol: [`extension/src/sw/browser-host.ts`](extension/src/sw/browser-host.ts)
- File/directory pickers: [`extension/src/options/browser-file-source-ui.ts`](extension/src/options/browser-file-source-ui.ts)
- Sentinel job path: `browser://selected-job`

Handles are stored in IndexedDB and read from the service worker. After a browser restart the permission may be `prompt`; the options page exposes a “恢复访问” action. Supported on Chrome / Edge; Brave requires enabling `File System Access API` in `brave://flags`.

#### Chromium extension runtime messages

Popup → service worker (batch only):

- [`RuntimeUploadAllTabsMessageSchema`](extension/src/runtime/runtime-message.ts): `{ type: "runtime.uploadAllTabs", jobFilePath: string }`
- [`RuntimeFillAllTabsMessageSchema`](extension/src/runtime/runtime-message.ts): `{ type: "runtime.fillAllTabs", jobFilePath: string }`

Host → browser (`applyJobReady.payload`) attachments:

- `attachments.video`:
  - `inlineBase64Chunks`: videos under policy `maxDirectAttachBytes` (default 1 GiB); small files (≤ ~400 KiB) inline in one `applyJobReady`, larger ones via `videoStreamStart` + `videoStreamChunk` frames then assembled in the service worker
  - `manualLargeFile`: videos over `maxDirectAttachBytes`; in-page banner to select the video manually
- Multi-frame host replies (stream + final `applyJobReady`) are collected by [`postBrowserHostSession`](extension/src/sw/browser-host-session.ts)
- `attachments.cover`:
  - `inlineBase64` if small enough for one frame; larger covers use `coverStreamStart` / `coverStreamChunk` (merged in the service worker); over policy max → `skipped`
  - On **Fill fields**, all text/radio/tag/partition fields run first; **cover is last** on platforms with cover UI (bilibili: poll until cover trigger ready, then `.cover-img` → `.upload-area` → `input[type=file]`). Close the modal manually after review.

Service worker → content script:

- [`ContentMessageType.ApplyJob`](extension/src/content/content-message-type.ts): `{ type: "content.applyJob", payload: AppliedJobPayload }`

#### Dev workspace (watch + debug from the repo)

Chromium **does not** auto-reload unpacked extensions when `extension/dist/*` changes. You still **reload once per successful rebuild** (fast: pin `chrome://extensions` or use a reloader shortcut). You **do not** re-“Load unpacked” every time.

- **Watch everything:** [`pnpm dev`](package.json) runs two concurrent watchers:
  - `tsc --watch` → [`packages/domain`](packages/domain) `dist/`
  - [`esbuild --watch`](scripts/build-extension.mjs) → [`extension/dist`](extension/dist) (prints a line when a rebuild finishes)
- **Editor integration:** [.vscode/tasks.json](.vscode/tasks.json) — default build task runs `pnpm dev` in a dedicated terminal. [.vscode/launch.json](.vscode/launch.json) — **Chrome: Bilibili + load extension** launches Chromium with `--load-extension=${workspaceFolder}/extension` and a **persistent** `userDataDir` under [`.vscode/chrome-profile-dev`](.vscode/launch.json).
- **Inspect:** MV3 **service worker** → Extensions → your extension → “Service worker” → _inspect_. **Popup** → extension icon popup → inspect. **Content script** → normal page DevTools on the Bilibli tab.

**“Message port closed” / long-running popup actions**

- Run `pnpm build`, then **Reload** the extension on `chrome://extensions`.
- The service worker **acks immediately**; the real result is read from **`chrome.storage.local`** (do not treat DevTools “message port closed” as the final outcome).
- **Upload video first**: files **> ~400 KiB** and **≤ policy max** (default 1 GiB) stream as chunked extension messages and attach silently; files **> max** show the manual banner.
- **`Receiving end does not exist`**: focus the **Bilibili upload tab**, **refresh** it after reloading the extension, then retry. The extension will inject the content script automatically if needed.

#### Build outputs

- Workspace build: [`pnpm build`](package.json) builds `@yanxu/domain` and bundles `extension/dist/*` via [`scripts/build-extension.mjs`](scripts/build-extension.mjs)
- Load unpacked: select the [`extension`](extension/manifest.json) directory (after `pnpm build`)

## fields

### bili

{
"creativeStatement": "含AI生成内容",
"creativeStatementAuth": "内容为自制：未经作者允许，禁止转载"
}
