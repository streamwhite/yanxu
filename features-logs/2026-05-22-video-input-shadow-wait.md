# Fix: video file input not found (batch / Douyin)

## Problem

Batch **Upload video (all tabs)** failed with `video_file_input_not_found` when Douyin (or other SPAs) render `input[type=file]` inside shadow DOM or only after clicking an upload trigger.

## Workflow

```mermaid
flowchart LR
  SW -->|applyJob videoOnly| CS
  CS -->|click trigger| Trigger
  CS -->|poll deep query| Input
  Input -->|assignFile| File
```

## Changes

- Deep DOM query (`queryAllDeep`) + `waitForVideoFileInput` (8s poll)
- Douyin: click upload trigger hints before wait
- Batch: sort tabs by upload URL score (`scorePlatformUploadUrl`) so upload pages win over creator home
- Error includes platform: `video_file_input_not_found:douyin`

## Usage

1. Open **upload** tabs: Bilibili member upload, `creator.douyin.com/.../content/upload`, 视频号 create.
2. Reload extension after build.
3. **Upload video (all tabs)** with batch job.
