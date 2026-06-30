# Platform auto-submit after review

## Problem

After upload and fill, user reviews each platform manually but clicking publish on every tab is tedious.

## Fix

- Popup section **Publish (after review)** with per-platform:
  - **Reviewed** checkbox (must be checked before submit)
  - **Submit** button (clicks publish on all tabs for that platform)
- Content script finds and clicks platform submit controls:
  - **bilibili:** `.submit-add` / 立即投稿
  - **douyin:** `#popover-tip-container button` / 发布 (exact label; ignores 定时发布)
  - **视频号:** `button.weui-desktop-btn_primary` 发表
- Service worker `runtime.submitPlatformTabs` runs tabs sequentially with stagger; each tab is activated before submit (bilibili/douyin need foreground for visible publish controls; 视频号 already required activation).
- **视频号** uses batched submit (default batch size 5, 5 min between batches) — see `2026-06-14-channels-batched-submit.md`.

## Workflow

```mermaid
flowchart TD
  Review[User reviews platform tabs] --> Check[Check Reviewed checkbox]
  Check --> Submit[Click Submit platform]
  Submit --> Tabs[For each platform upload tab]
  Tabs --> Activate[Activate tab and wait for settle]
  Activate --> Click[Content script clicks publish control]
  Click --> Dialog[User confirms any platform dialogs manually]
```
