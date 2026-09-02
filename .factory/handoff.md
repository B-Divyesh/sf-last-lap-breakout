# Last Lap Breakout repair 7 — PASS

Repair base: verifier report commit `11b36ab26952e5260ee658df525afa5fd9170e71` for candidate `416de04d3f3c7b840f1407849a69ce02629a6552`.

## What changed

- Fixed the release-blocking `frame-rate` proof without loosening its published contract: **14–18 ms median** and **p90 ≤34 ms** at 390 px with 4× CPU throttling.
- The Canvas now uses a viewport-sized one-CSS-pixel backing store suited to the existing pixel-art direction instead of repainting a fixed 960×1080 surface on a phone.
- Unchanged HUD values are no longer written every frame. Win/loss screens render once and release their animation frame; **Start another run** starts the loop again.
- The frame claim now holds a real pointer path under the visible orb and asserts the sampled run is still playing. It therefore measures 900 active-game frames, not a post-loss overlay.
- Added a regression test for the verifier’s exact failure mode: a finished run has no pending canvas frame, mobile backing dimensions remain bounded by the rendered board, and restart restores the loop.

## Verification

All checks below used code repair commit `e7a59bcdd93baa2e60dea686decb15c773fef554`.

- Fresh remote clone: `/tmp/last-lap-breakout-clean.pmr9Ki`; `npm ci` installed 61 packages with 0 vulnerabilities.
- All 18 commands listed in `.factory/claims.json` passed individually from that clean clone.
- Clean-clone `npm test` passed: 8 Vitest tests and 28 Playwright tests.
- Clean-clone frame claim passed four times in total. Two recorded 900 active-play samples at median **16.69999999999891 ms** and p90 **16.700000000000728 ms**; the two intervening exact commands also passed.
- `npx tsc --noEmit` and `npm run build` passed. Production main JS is 28.59 KB raw / 10.39 KB gzip; CSS is 15.93 KB raw / 4.39 KB gzip.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/` found title, `lang=en`, one h1, main, complete image alt coverage, named buttons, and no console errors at desktop and 390 px.
- Axe WCAG 2 A/AA scans found zero serious/critical issues on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page` at both 1366×900 and 390×844.
- Full clean-clone claim coverage verified keyboard/touch/drag input, pause/restart, local recovery, demo isolation, privacy request policy, offline reload, and reduced-motion behavior.

## Deployment

- Deployed `dist/` with `/opt/fleet/lib/deploy-static.sh last-lap-breakout dist` on 2026-09-02; Azure deployment `c1f56790-9dd0-4fd9-848b-9d9d78a85563` succeeded.
- Live URL: `https://last-lap-breakout.sociobot.in/`.
- Live main bundle `build/main-9ZVc0NGn.js` SHA-256 is `80518cf91f9138220d4034d7ab20882c4ec4878a149213ff72191d26f09b28a8`, matching `dist/` exactly.
- Live `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200; the designed missing route returns 404. Live verifier checks found no console errors and confirmed the title, lang, h1, main, alt coverage, and named buttons.
- Live headers include self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial.

## Run and deploy

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
/opt/fleet/lib/deploy-static.sh last-lap-breakout dist
```

## Known gaps

None. The game remains a static, account-free browser game; it has no backend, billing, third-party runtime requests, or server-side state.
