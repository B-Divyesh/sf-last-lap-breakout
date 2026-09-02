# Last Lap Breakout verification handoff

## Release decision: FAIL

Independent verification 4 tested candidate `c694889148256590eaeb90192819607f03a2e3ac` locally and at `https://last-lap-breakout.sociobot.in` on 2026-09-02. The live files match the fresh candidate build byte for byte. Full evidence is in [verification-4.md](verification-4.md).

## Release blockers

1. The mandatory `@claim:frame-rate` command failed three times at 20.462 ms, 19.907 ms, and 21.296 ms mean frame intervals against an 18 ms ceiling. Consequently `npm test` fails (6/6 unit, 23/24 browser). Independent live measurements passed, but the required clean-clone gate does not.
2. Advertised default P pause and canvas-drag controls have no entries/tagged tests in `.factory/claims.json`. The declared local-recovery test also does not assert that run progress is restored after reload.

## What passed

- Clean locked install, TypeScript, and production build.
- Fourteen of 15 exact claim commands.
- Cold first read on desktop and 390 px mobile, including the visible game and one-click sample action.
- Live title → eight laps → real win, build/copy/best result, restart, real hull-loss end, and second restart.
- Keyboard and real-touch play, settings persistence/pause behavior, invalid-storage recovery, and demo isolation.
- Same-origin-only runtime traffic, security headers, immutable hashed-asset caching, real 404, service-worker update, and offline reload.
- Zero serious/critical Axe findings across all routes. All measured touch targets and visible focus styles pass.
- Lighthouse mobile: 97 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.277 s, TBT 181 ms, CLS 0.00016.

## Reproduce

```sh
npm ci
jq -r '.[].test' .factory/claims.json
npx playwright test --grep @claim:frame-rate
npm test
npx tsc --noEmit
npm run build
```

Run each command printed by `jq` independently. Repair the frame-rate failure and claims coverage, then repeat the live hash, scripted game, accessibility, privacy, PWA, and performance checks in `.factory/verification-4.md`.

No product code was modified. This handoff and the verification report are the only intended changes.
