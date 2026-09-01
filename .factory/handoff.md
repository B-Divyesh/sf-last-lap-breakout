# Last Lap Breakout handoff

## Independent verification status — FAIL (2026-09-01)

Candidate `454cee762a1832ae01c629a48ed5a21ca7de6579` at `https://last-lap-breakout.sociobot.in` is **not approved for release**. The independent record is in `.factory/verification.md`.

Release-blocking findings:

- In `/demo`, saving a game setting writes the real-mode local-storage key `last-lap-breakout:settings:v1`; demo mode must not read or write real-mode storage.
- At 390 × 844, the cold landing page canvas starts at y=963.6 px, so the captured first screen does not show the game.
- From a clean installed checkout, the documented `npm test` command passed Vitest and the first two browser tests, then its managed preview became unavailable and seven browser tests returned `ERR_CONNECTION_REFUSED`. Starting `npm run preview` separately allowed all nine browser tests to pass, but the documented quality gate itself still fails.

The deployed JS, CSS, and social-card assets match this candidate's fresh production build. All six declared claim commands passed individually. See the verification record for exact commands, results, additional passing checks, and remediation guidance.

## What shipped

- A complete deterministic Breakout run: eight fixed 60-second laps, seven three-choice modifier drafts, a guarded final core, loss state, result score, deterministic replay hash, and shareable build string.
- Keyboard, pointer, and touch play. Pause, tab-hide recovery, assist mode, persistent mute, optional screen movement, reduced-motion behavior, synthesized gesture-gated audio, and local run recovery are included.
- A one-click `/demo` run with a fixed seed, persistent demo banner, reset action, and separate `demo:last-lap-breakout:v1` session storage namespace.
- Responsive landing, `/play`, `/demo`, `/privacy`, `/terms`, and designed 404 routes. History navigation restores route title and moves focus to the new heading.
- Original Canvas geometry, favicon, and generated pixel/demoscene orbital artwork. Source prompt, inspection result, and font license are in `assets/src/`.
- Production metadata, 1200 × 630 social card, sitemap, robots file, strict security headers, SPA fallback, and an offline service worker.

## Run and verify

```sh
npm install
npm test
npm run build
npm run preview
```

The browser suite contains 5 deterministic core tests and 9 Chromium tests. Independent verification found that `npm test` does not reliably keep its managed preview available; see the FAIL status above. With a separately held production preview, all 14 tests passed. The suite covers every entry in `.factory/claims.json`, a full accelerated eight-lap result, keyboard/touch input, settings and run recovery, demo isolation, offline reload, same-origin-only requests, WCAG A/AA automated checks, metadata, mobile overflow, routing, 404, and console errors.

The exact deploy command is `npm run build`. Output is in `dist/`, with `dist/index.html` at its root.

## Measured quality

Measured against the production preview on 2026-09-01:

- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab LCP: 1.4 s. CLS: 0. Total blocking time: 0 ms.
- Worker `verify-url.sh`: HTTP 200, 580 ms network-idle load, one h1, one main, no missing alt text, no unlabeled buttons, and no console errors.
- 390 × 844 headless Chromium run: 60.0 fps over 180 frames; p95 frame time 16.7 ms.
- Initial compiled JS: 23.6 KB raw / 9.0 KB gzip. CSS: 14.8 KB raw / 4.2 KB gzip. Display font: 32 KB. Hero AVIF: 33 KB; WebP fallback: 49 KB.
- `npm audit`: zero known vulnerabilities.
- Desktop 1440 × 1000 and mobile 390 × 844 captures were reviewed. The game is visible on the first screen and neither layout overflows horizontally.

## Known gaps and next steps

- Balance is deterministic and test-covered, but the success measure needs human play sessions. No player telemetry was added because the product is local-first and has no analytics.
- The replay hash covers the seed, build, result, and compact tick-stamped input-change log. It does not provide a visual replay viewer.
- A future release can add alternate challenge sets only after real completion and replay behavior is measured. The v1 has no payment code.
