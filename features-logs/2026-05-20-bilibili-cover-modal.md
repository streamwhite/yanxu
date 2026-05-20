# Bilibili cover modal upload

## Flow

**Fill fields** order: sourceType → partition → title → description → tags → **cover last** (300 ms settle + blur before modal).

```mermaid
sequenceDiagram
  CS as Content script
  Page as Bilibili page

  CS->>Page: fill all page fields
  CS->>Page: wait + blur focus
  CS->>Page: click .cover-img (封面设置)
  Page-->>CS: visible .upload-area with 上传封面
  CS->>Page: click upload area, wait for modal input[type=file]
  CS->>Page: assign File (verify input.files) or drag-drop fallback
  Note over Page: user closes modal manually
```

## Paths

- [`extension/src/content/apply-cover-via-modal.ts`](../extension/src/content/apply-cover-via-modal.ts)
