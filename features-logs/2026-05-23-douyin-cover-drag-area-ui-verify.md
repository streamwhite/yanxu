# Douyin cover: step-2 drag area + UI verify

## Problem

Logs showed `douyin_cover_assigned` / `cover_upload_done` but user saw no cover. Modal opened (step 1) but step 2 (`.semi-upload-drag-area`) was not used correctly; DOM `files` assignment is a false positive for Semi Upload.

## Fix

```mermaid
sequenceDiagram
  participant T as 选择封面 trigger
  participant M as #dy-creator-content-modal-body
  participant D as .semi-upload-drag-area
  participant I as image input
  T->>M: click opens modal
  D->>D: click drag area + main text
  D->>I: drag-drop + assignFileToInput
  M->>M: waitForDouyinCoverUploadApplied (preview/list)
```

- Step 2: `findDouyinCoverDragArea` + click main text
- Success only when `douyinCoverUploadLooksApplied` (not `inputHasAssignedFile` alone)
