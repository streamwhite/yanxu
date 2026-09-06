# 提交横向图片 (horizontal cover)

## Problem

Batch uploads only reuse the vertical cover as the horizontal cover. Platforms like
douyin distinguish a horizontal (4:3 / 横封面) cover element, and reusing the vertical
image there looks wrong.

## Behaviour

A new **提交横向图片** checkbox on the popup (default unchecked). When checked:

- Each item's horizontal cover file is resolved from `{cover stem}-4x3.{png|jpg|jpeg}`
  (same folder as the cover image).
- Missing horizontal covers fail fast with `horizontal_cover_assets_missing` before any
  tab is touched.
- The horizontal file is submitted to the platform's horizontal cover element:

  - **douyin**: after uploading the vertical cover, click 设置横封面 and upload the
    `-4x3` file into the same modal.
  - **视频号 (channels)**: upload the `-4x3` file directly to `.horizon-cover-wrap` via
    its 编辑 button instead of clicking 使用素材.
  - **bilibili**: horizontal cover is ignored (no such element).

## Flow

- Popup `submitHorizontalCover` → runtime message (zod optional boolean, default absent).
- Domain/native-host: `includeHorizontalCover` flag threads through host protocol.
  Horizontal cover streams out-of-band (`horizontalCoverStreamStart`/`Chunk`) like the
  existing cover stream; the extension merges it into `attachments.coverHorizontal`.
- Content: `applyCoverWithRetry`/`applyCoverViaModal` forward an optional horizontal
  `File` to the platform modal implementations.

## Naming

- `submitHorizontalCover`: popup → runtime message flag.
- `includeHorizontalCover`: native-host protocol + slot-apply options.
- Missing-asset code: `horizontal_cover_assets_missing`.

## Test coverage

Added/updated unit + jsdom tests for domain candidates/required-assets, native-host
outbound batch, stream merge, runtime schema, douyin modal, channels modal, and
`applyUploadThenFillAllTabs` fail-fast/threading.