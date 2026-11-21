# Bilibili dual-ratio cover upload

## Problem

Bilibili's cover editor keeps separate 4:3 and 16:9 covers behind a
**双比例同步改动** checkbox. Uploading a file without that option only updates one
ratio, so the other cover appears missing. This is especially visible on a fresh
browser profile (for example Edge) where the sync option was never enabled manually.

## Behaviour

- The Bilibili cover trigger accepts both the classic `.cover-img` (封面设置) and the
  current `.cover-module-main .cover-empty` entry.
- The editor is detected from its file input, sync label, or upload area, including
  hidden image inputs.
- Before uploading, **双比例同步改动** is enabled when present. The extension waits up to
  a few seconds for the option to mount (Edge can render the file input before the sync
  control) and retries through the label if the checkbox click does not stick.
- When the popup's **提交横向图片** option supplies a `-4x3` cover, Bilibili uploads that
  file; both ratios are then synced from it. Otherwise the default cover is used.
- The cover editor is left open after the upload so the user can review the crop and
  click **完成** manually. The extension does not submit or close the editor.
- The classic upload-area flow remains as a fallback for older page versions.

## Tests

[`tests/extension/apply-bilibili-cover-via-modal.test.ts`](../tests/extension/apply-bilibili-cover-via-modal.test.ts)
covers the sync option, the 4:3 file choice, hidden inputs, leaving the editor open, and
the classic fallback.
