# 视频号 title / description / 原创声明

## Scope

- Title: `input.weui-desktop-form__input` placeholder 概括视频主要内容…
- Description: `div.input-editor[contenteditable][data-placeholder="添加描述"]`
- `sourceType: "original"` → checkbox + `.original-proto-wrapper` 协议确认

## Workflow

```mermaid
flowchart TD
  F[Fill fields] --> O{sourceType original?}
  O -->|yes| C[Click 原创声明 checkbox]
  C --> M[Check agreement in original-proto-wrapper]
  M --> OK[Click 声明原创 primary button]
  O -->|no| T[Title + description]
  OK --> T
```

## Job

```json
"channels": { "title": "…", "description": "…", "sourceType": "original" }
```

Batch item `sourceType` projects to channels the same as bilibili.
