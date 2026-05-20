# Change: Plans doc — semi-auto + Playwright detection

## Summary

Extended `docs/bilibili-auto-upload-plans.md` for **semi-automatic upload** (fill all fields / optional attach; **manual Submit**), addressing time and mistake pain; added **Playwright, detection, and safer patterns** (no undetectability claims; APIs; semi-auto; headed/pacing; extension vs Playwright; avoid stealth patching); updated shared requirements row, intro pointers, **Plan B** modes (semi vs full), decision mermaid (submit yourself → S1 vs fill-only → merge to multi-platform), pragmatic default, and job schema step for `publish` policy.

## Workflow

```mermaid
flowchart LR
  T[todo: semi-auto + Playwright safety] --> U[Update plans MD]
  U --> L[features-log]
```

## Files

- `docs/bilibili-auto-upload-plans.md`
- `features-logs/2026-05-20-semi-auto-playwright-detection.md`
