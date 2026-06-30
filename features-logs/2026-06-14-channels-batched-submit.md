# 视频号 batched submit

## Problem

视频号 rate-limits rapid consecutive publishes. Submitting many tabs at once can fail.

## Fix

- Popup **视频号 batch size** (default 5) and **Batch interval (min)** (default 5)
- `submitPlatformTabs` for 视频号 submits tabs in batches, waits between batches
- Bilibili and douyin still submit all tabs sequentially with short stagger
- Runtime timeout scales with batch interval for long 视频号 submit runs

## Workflow

```mermaid
flowchart TD
  Submit[Submit 视频号] --> Batch1[Submit batch 1 up to N tabs]
  Batch1 --> Wait[Wait interval minutes]
  Wait --> Batch2[Submit batch 2]
  Batch2 --> More{More tabs?}
  More -->|yes| Wait
  More -->|no| Done[Done]
```
