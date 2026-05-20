## Semi-auto extension + native messaging host

### Summary

Implemented a pnpm TypeScript workspace with `@auto-upload/domain`, `@auto-upload/native-host`, and a Manifest V3 Chromium extension that fills Bilibili creator upload fields from a local JSON job file via Chrome Native Messaging.

### Workflow

```mermaid
flowchart LR
  JobJsonOnDisk --> NativeHostReadValidate
  NativeHostReadValidate --> ExtensionServiceWorker
  ExtensionServiceWorker --> ContentScriptFill
  ContentScriptFill --> CreatorPublishManual
```

### Files

- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `jest.config.cjs`, `biome.json`, `scripts/build-extension.mjs`
- `packages/domain/**`
- `packages/native-host/**`
- `extension/{manifest.json,popup.html,src/**}`
- `examples/bilibili.job.example.json`
- `docs/API.md`
