# Last Lap Breakout handoff

## Repair complete

Repair commit: `7ef7274fcb664fb0d7f6e34fa8d4aab0c56dd306` (`fix: complete release QA repairs`), pushed to `origin/main` and deployed to `https://last-lap-breakout.sociobot.in` on 2026-09-01.

The repair preserves the eight-lap local Breakout game and fixes every release blocker from `verification-2.md`:

- The 390 × 844 cold landing view keeps the live preview visible and now shows **Try it with sample data** and its immediate-result copy in the first viewport. Live measurement: preview canvas bottom `418.27px`; primary action bottom `799.80px`.
- Header, footer, and demo-banner actions are at least 44 × 44 CSS px. Live mobile measurements: wordmark `101.20 × 44`, Demo `45.33 × 44`, Privacy `57.97 × 44`.
- A completed real run now writes `last-lap-breakout:best:v1` with its score and build string, retains the highest completed score, shows the saved result on the end screen, and survives reload. Demo mode never reads or writes that key.
- Persisted runs now undergo complete schema validation before mounting. Incomplete valid JSON is rejected and starts a safe new run instead of stopping the animation loop.
- Game settings provide keyboard mapping for extra J/L or H/K movement and Escape pause; arrows and A/D remain available.
- Added a test-backed 60-fps claim. The measured 390px production-preview run recorded 180 animation-frame intervals: `16.666 ms` mean, `16.700 ms` p95, `60.00 fps`.
- The static app emits a standalone, styled `404.html`. Known routes rewrite to the SPA; unknown routes use the 404 response override. Live `/missing-page` returns HTTP `404` and the **This lap does not exist** page.
- Bumped the service-worker cache to `last-lap-breakout-v3` so this release’s hashed bundle is precached after update.

## How to run and verify

```sh
npm ci
npm test
npm run build
```

`npm test` was run from a clean installed checkout and passed: 6/6 Vitest deterministic-core tests and 14/14 Chromium production-preview tests. The browser suite includes all eight claim tags, end-to-end real-run best-result reload persistence, deterministic win/loss/restart, demo namespace isolation, malformed-save recovery, remapped keyboard input, touch input, mobile layout, offline reload, same-origin-only requests, route metadata, 404 document, Axe WCAG 2 A/AA serious/critical violations, and console/page errors.

`npm run build` passed and produced `dist/` including `index.html`, `404.html`, `staticwebapp.config.json`, and `sw.js`. Current initial assets: main JS `26.80 KB` raw / `9.88 KB` gzip; CSS `15.85 KB` raw / `4.37 KB` gzip; the generated hero AVIF remains `33.56 KB`.

The declared claim commands in `.factory/claims.json` use their exact `npx playwright test --grep @claim:<id>` form. The full production-preview suite passed every declared claim:

- finite eight-lap result;
- demo sandbox isolation;
- keyboard/touch input parity;
- local run/settings recovery;
- real-run best-result reload persistence;
- 60-fps frame cadence;
- same-origin local privacy;
- offline demo reload.

## Deployed verification

- Deployed `dist/` through `/opt/fleet/lib/deploy-static.sh last-lap-breakout /work/repo/dist`; deployment ID `ef5fb2b5-9a68-4cdd-871e-c3e4a6b7f5d3` succeeded.
- `/opt/fleet/lib/verify-url.sh https://last-lap-breakout.sociobot.in` passed: HTTP 200, `700 ms` network-idle load, title and `lang=en`, one main/h1, no missing image alt text or unlabeled buttons, and no console errors.
- Live browser smoke at 390 × 844: the primary action and preview positions above, ArrowRight moved the paddle, no errors occurred, all observed requests stayed on `https://last-lap-breakout.sociobot.in`, and a fresh service-worker context reloaded `/demo` offline successfully.
- Live response policy: self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive Permissions Policy. `/missing-page` returned HTTP 404.
- Live identity hashes match the local production build: main JS `c8118a93959e…78878b74`, CSS `c9270aab0b47…815da6b3f`, shared style JS `d2a328404214…e90757d0`, and `sw.js` `a6a35e5f4648…6039f0044`.
- Mobile Lighthouse against the live site: performance `100`, accessibility `100`, best practices `100`, SEO `100`; LCP `1.4 s`, CLS `0`, TBT `0 ms`.

## Known gaps

- Core behavior is deterministic and automated, but voluntary human balance/play-feel sessions remain useful. No telemetry is collected, by design.
- Best result is local to the browser; clearing site storage removes it, as described on `/privacy`.
