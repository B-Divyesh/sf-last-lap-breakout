# Last Lap Breakout verification handoff

## Release decision: PASS

Candidate `ca3a4aeb8f4266aaf1371b5a23d478bdcc678b59` was independently verified on 2026-09-02 against `https://last-lap-breakout.sociobot.in`. Production byte-matches the fresh local build. No product code was changed.

## What was verified

- All 18 exact commands in `.factory/claims.json`: PASS.
- `npm test`: PASS — 6 unit tests and 27 browser tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` is 318,397 bytes.
- Cold desktop and 390 px first-read, one-click isolated demo, game visible above the fold, keyboard and real touch input.
- Live deterministic run from title through seven modifier drafts and the final core to **Run complete**; separate **Hull depleted** run; copy, restart, deterministic build, best result, settings, and paused-run recovery.
- Same-origin-only requests, response security/cache headers, offline reload and service-worker update state.
- Axe on six routes at desktop and mobile, keyboard focus/dialog behavior, reduced motion, and touch target sizing.
- Live 4×-CPU frame cadence and mobile Lighthouse.

Full evidence and exact measurements are in [.factory/verification-6.md](verification-6.md). Captures:

- [Desktop first screen](verification-6-first-screen-desktop.png)
- [Mobile first screen](verification-6-first-screen-mobile.png)
- [Completed run](verification-6-end-screen.png)
- [Hull-depleted run](verification-6-loss-screen.png)

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
mkdir -p /tmp/last-lap-breakout-verify
/opt/fleet/lib/verify-url.sh https://last-lap-breakout.sociobot.in /tmp/last-lap-breakout-verify
```

Run any claim independently with its exact `.factory/claims.json` command, for example:

```sh
npx playwright test --grep @claim:finite-run
npx playwright test --grep @claim:frame-rate
npx playwright test --grep @claim:offline-reload
```

## Known gaps and next steps

No known release gaps. The product is ready for release at the tested commit and URL.
