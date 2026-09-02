# Last Lap Breakout repair 6 handoff — PASS

## Delivered

Repaired the only release blocker in independent verification commit `ae6ef40c429113415770b16b55dd2fd7628c8fd5` for candidate `95e9d32892b5c4708773241bf46c2767bb5fca03`.

The old frame claim sampled 300 intervals after only 60 warm-up frames. Clean-worker startup scheduling could therefore push its nearest-rank p90 to 50 ms even though later and live samples ran at 16.7 ms. The repair now:

- waits for network idle, fonts, images, the service worker, and a browser idle turn;
- discards 180 requestAnimationFrame warm-up intervals;
- measures the same honest 14–18 ms median and ≤34 ms p90 promise over 900 gameplay intervals;
- records the full protocol and result in the Playwright attachment;
- has deterministic unit coverage that recreates the former 50 ms p90, proves startup intervals are excluded, and proves sustained slow gameplay still fails.

The published performance limit was not weakened or removed. No production behavior, visual design, storage behavior, or previously passing claim changed.

## Verification

### Clean repository

- Clean clone: `/tmp/last-lap-breakout-repair-6.iFe79b/repo`.
- `npm ci`: PASS — 61 packages, 0 vulnerabilities.
- All 18 exact `.factory/claims.json` commands: PASS independently, without retries.
- `npm test`: PASS on its first clean-clone run — 8/8 Vitest tests and 27/27 Playwright tests.
- `npx tsc --noEmit`: PASS. There is no separate lint script in this TypeScript repository.
- `npm run build`: PASS; `dist/` is 326,439 bytes.
- Main JavaScript: 28,061 bytes raw / 10,141 bytes gzip. CSS: 15,925 bytes raw / 4,390 bytes gzip. Font: 32,220 bytes. Mobile AVIF: 33,560 bytes.
- Repaired local frame claim: 390 × 844, touch/mobile emulation, device scale factor 2, 4× CPU throttle, 180 warm-up frames, 900 samples; median 16.70 ms and p90 16.70 ms.

The unmodified candidate's exact frame command and full suite both happened to pass on this worker before the repair, consistent with the verifier's intermittent diagnosis. The regression fixture deterministically recreates the verifier's 50 ms p90 under the former 60/300 sampling protocol.

### Live product

- Deployment: Azure Static Web Apps production deployment `e05f6679-57a8-4fdb-ac2b-121945509e4e` on the existing `sf-last-lap-breakout` resource.
- URL: `https://last-lap-breakout.sociobot.in` returned HTTPS 200; HTTP redirected to HTTPS. `/demo`, `/play`, `/privacy`, and `/terms` returned 200; `/missing-page` returned the designed 404.
- Identity: all 19 public files in `dist/` byte-matched the live hostname. Representative SHA-256 values remain `bc31325d…` (`index.html`), `c0fd0b74…` (main JS), `5c7c914a…` (CSS), and `4ac8f70f…` (`sw.js`).
- Factory URL verifier: PASS on `/` and `/?demo=1`; no console errors, one h1/main, `lang="en"`, complete alt text and button names. Desktop and 390 px captures are under `.factory/evidence/repair-6/`.
- Browser matrix: 12 Axe WCAG 2 A/AA audits across six routes at desktop and 390 × 844 found zero serious/critical issues, zero valid-route console/page errors, no horizontal overflow, and no visible touch target below 44 × 44 px.
- Keyboard/touch: first Tab focused the designed skip link; ArrowRight moved the paddle from 0.500 to 0.614; the mobile touch control moved it from 0.500 to 0.614. Settings moved focus to Assist mode and returned it to Game settings on Escape.
- End to end: an isolated live demo traversed all eight real runtime boundaries, reached **Run complete** with build `LLB-7B4T5S-CEBQHDW-0CK0EX0`, and restarted at lap 1. A separate one-hull run reached **Hull depleted** and restarted at lap 1.
- Privacy: the exercised demo flow made five requests, all same-origin. Demo storage remained isolated; no account, analytics, payment, advertising, or third-party runtime request exists.
- Offline/update: the service worker controlled the page, was activated with no waiting/installing worker, only cache `last-lap-breakout-v4` remained, and `/demo` reloaded offline.
- Response policy: self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation/payment denial, 30-second HTML revalidation, and one-year immutable hashed-build caching all passed live.
- Live frame cadence: 390 × 844 touch/mobile, 4× CPU throttle, 180 warm-up frames and 900 samples; median 16.70 ms, p90 16.70 ms.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.059 s, LCP 1.284 s, TBT 0 ms, CLS 0.00016, transfer 83,220 bytes.

This is a static browser game. Backend, API allowance/429, billing, account, AI, package-consumer, and server persistence checks do not apply.

## Evidence

- `.factory/evidence/repair-6/root/verify.json`
- `.factory/evidence/repair-6/root/screenshot-desktop.png`
- `.factory/evidence/repair-6/root/screenshot-mobile.png`
- `.factory/evidence/repair-6/demo/verify.json`
- `.factory/evidence/repair-6/demo/screenshot-desktop.png`
- `.factory/evidence/repair-6/demo/screenshot-mobile.png`
- `.factory/evidence/repair-6/lighthouse.json`

## Run locally

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Use `http://localhost:4173/?demo=1` for the isolated sample game.

## Known gaps and next steps

None.
