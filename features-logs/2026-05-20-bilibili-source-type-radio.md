# Bilibili source type (自制 / 转载)

## Job field

`bilibili.sourceType`: `"original"` | `"repost"`

## Workflow

```mermaid
flowchart LR
  Job["job JSON sourceType"] --> Map["original → 自制\nrepost → 转载"]
  Map --> Click["click .check-radio-v2-container by .check-radio-v2-name"]
```

## Paths

- [`packages/domain/src/constants/bilibili-source-type.ts`](../packages/domain/src/constants/bilibili-source-type.ts)
- [`extension/src/content/click-radio-by-label.ts`](../extension/src/content/click-radio-by-label.ts)
