# Extension: batch-only popup

## Change

Removed single-tab upload/fill (v1/v2) from popup and service worker. Extension accepts **jobVersion 3** batch files only.

## Workflow

```mermaid
flowchart LR
  Popup -->|uploadAllTabs / fillAllTabs| SW
  SW -->|batch_job_required if not v3| Stop
  SW -->|applyJobToAllTabs| Tabs
```

## Popup

1. Upload video (all tabs)
2. Fill fields (all tabs)
