# Change: pageFields locators + two-step upload + message-port fix

## Summary

- Job **v2**: `pageFields[]` with `locator.css` | `id` | `name` and `value`; optional `bilibili.*` defaults.
- Popup split: **Upload video first** (`videoOnly`) then **Fill fields** (`fieldsOnly`, small native reply).
- **Storage-backed** runtime results so popup no longer hangs on “message port closed”.

## Workflow

```mermaid
sequenceDiagram
  Popup --> SW
  SW --> NativeHost
  NativeHost --> SW
  SW --> Storage
  Storage --> Popup
  SW --> CS
```

## Files

- `packages/domain/src/schema/*`, `packages/native-host/src/router/*`
- `extension/src/popup/*`, `extension/src/sw.ts`, `extension/src/content/*`, `extension/popup.html`
