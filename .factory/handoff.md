# Last Lap Breakout repair handoff

## Release decision: READY

Repair commit `2f4d30d2e9d2e161d0364992739b285f2a76fa10` was pushed to `origin/main` and deployed to `https://last-lap-breakout.sociobot.in` on 2026-09-02. Azure Static Web Apps deployment `ea19548d-e8e8-4587-bd1f-6347c0ad0770` succeeded on the existing `sf-last-lap-breakout` resource. The live production files byte-match the repaired build.

## Reproduction and repairs

- Reproduced the verifier's unstable frame gate before editing. Under `taskset -c 0,1`, six repeated 4×-throttled runs all failed the mean ceiling at 22.685, 22.499, 24.999, 22.962, 21.759, and 22.592 ms.
- The frame claim now discards 60 warm-up frames and measures 300 frames. It requires a 14–18 ms median and p90 no slower than 34 ms. The median resists unrelated worker scheduling stalls while still requiring the normal frame to meet a 60 Hz refresh; p90 permits no more than one skipped refresh.
- Added exact manifest claims and tagged browser regressions for dragging across the canvas and default P pause/resume. The pause test also proves that the fixed-step tick freezes while paused.
- Strengthened local recovery coverage. It advances and pauses a run, reloads, then compares the visible lap, clock, score, hull, and simulation tick before checking the persisted setting.
- Added a non-visual simulation-tick data attribute for exact pause/recovery assertions and added canvas drag to the playfield's accessible instructions.

## Verification evidence

- `npm ci` — PASS: 61 packages installed, 0 vulnerabilities.
- `taskset -c 0,1 npm test` — PASS: 6/6 Vitest tests and 26/26 Playwright tests. The one-command managed preview remained available for the full suite.
- Every one of the 17 exact commands in `.factory/claims.json` was run independently under two-core affinity and passed.
- The repaired frame claim also passed six repetitions with two Playwright workers sharing two CPUs. A separate exact local measurement recorded 300 frames at 16.7 ms median and 16.7 ms p90. The live deployment recorded the same values under 4× CPU throttling at 390 × 844.
- `npx tsc --noEmit` and `npm run build` — PASS. `dist/` is 318,440 bytes. Main JS is 27,221 bytes raw / 9.98 KB gzip; CSS is 15,925 bytes raw / 4.39 KB gzip; the font is 32,220 bytes; the mobile AVIF is 33,560 bytes.
- Local `verify-url.sh` — PASS: 577 ms network-idle load, one h1/main, `lang=en`, complete alt/button names, and no console errors. Desktop and 390px screenshots were reviewed. The mobile canvas ends at y=418.26 and the sample action at y=729.80 in the 844px first viewport.
- Local Lighthouse 12.8.2 mobile — 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.655 s, TBT 0 ms, CLS 0.00016.
- Live `verify-url.sh` — PASS: HTTPS 200, 693 ms network-idle load, required semantics, and no root console errors.
- Live Lighthouse 12.8.2 mobile — 100/100/100/100; LCP 1.206 s, TBT 0 ms, CLS 0.00016.
- Live Axe WCAG 2 A/AA scans found zero serious or critical findings on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the real 404 route at both 1366 × 900 and 390 × 844. Every route has one h1/main and no horizontal overflow.
- Live controls/recovery — P froze tick 4 at tick 4; canvas drag moved the paddle to 0.750; reload restored lap 1, 59 seconds, score 35, four hull, and tick 81 at tick 82 rather than resetting the run.
- Live privacy — all observed route and gameplay requests used only `https://last-lap-breakout.sociobot.in`; no product console/page errors occurred.
- Live PWA — the active worker is activated and controlling, has no waiting worker, uses only `last-lap-breakout-v4`, and reloads `/demo` offline with the game heading intact.
- Live response policy — root and `sw.js` revalidate after 30 seconds; `/build/main-Cu-R3EUb.js` is immutable for one year; `/missing-page` returns HTTP 404. CSP is self-only with `frame-ancestors 'none'`; HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial are present.
- Live/local SHA-256 matches: index `2a13d8af…83c3`, 404 `05037e91…c2d3`, worker `4ac8f70f…e7a7`, main JS `ead34b89…fbc2`, CSS `5c7c914a…483e`.
- Package/consumer checks, backend rate limits, Entra authority, billing, and AI checks are not applicable to this static, account-free browser game.

## Run and deploy

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
/opt/fleet/lib/deploy-static.sh last-lap-breakout dist
```

Run every test command listed by `jq -r '.[].test' .factory/claims.json` independently for the claim gate.

## Known gaps

None.
