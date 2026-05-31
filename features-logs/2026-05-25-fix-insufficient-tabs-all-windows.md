# Fix: insufficient_tabs when upload tabs are open

## Problem

Batch upload/fill returned `insufficient_tabs` with `found 0` even when enough Bilibili, Douyin, and 视频号 upload tabs were open.

## Cause

`queryPlatformUploadTabs` used `chrome.tabs.query({ currentWindow: true })`, which only sees tabs in the **last-focused window**. Upload tabs in other windows (or tabs still loading with `about:blank`) were ignored.

## Fix

- Query **all** browser windows: `chrome.tabs.query({})`
- Resolve URL from `pendingUrl` when the committed URL is empty or `about:blank`

## Workflow

```mermaid
flowchart LR
  Popup --> SW
  SW -->|query all windows| Tabs
  Tabs -->|upload URL score > 0| Validate
  Validate -->|enough tabs| Apply
```
