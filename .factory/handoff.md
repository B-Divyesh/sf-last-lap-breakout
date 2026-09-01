# Last Lap Breakout handoff

## Repair status — ready for deployment (2026-09-01)

This repair addresses every release blocker in the independent report for candidate `454cee762a1832ae01c629a48ed5a21ca7de6579`.

- Demo settings now use `sessionStorage` key `demo:last-lap-breakout:settings:v1`. `/demo` neither reads nor writes `last-lap-breakout:settings:v1`; reset clears only demo progress and settings.
- At 390 × 844, the live canvas is ordered before landing copy and its complete bounding box fits inside the cold viewport. Desktop layout is unchanged.
- `npm test` owns exactly one strict-port production preview for the whole Playwright suite. It never attaches to an existing server, and the preview command builds the current production bundle before it starts.
- Browser regressions now start from the title action, assert the deterministic end build `LLB-7B4T5S-CEBQHDW-0SBRZTA`, exercise a natural fixed-step loss, restart it, preload real demo settings to prove they are ignored, and save demo settings to prove only the demo namespace changes.

## Run and verify

```sh
npm ci
npm test
npm run build
```

`npm test` runs 6 Vitest core tests and 10 Chromium browser tests. Playwright builds and starts one managed `127.0.0.1:4173` production preview, then stops it after the complete suite. The suite covers all six declared claims, title-to-result, loss/restart, keyboard and touch input, settings and run recovery, demo isolation, offline reload, same-origin-only requests, WCAG 2 A/AA serious/critical findings, 390 px mobile layout, routes, 404, and console/page errors.

Production output is `dist/`; deploy the static contents with `public/staticwebapp.config.json` included by Vite.

## Verification evidence

- `npm ci` completed with 0 vulnerabilities.
- `npm test` passed on 2026-09-01: 6/6 core tests and 10/10 Chromium tests, including all claim tags.
- `npm run build` passed; emitted initial JS is 24.20 KB raw / 9.17 KB gzip and CSS is 14.89 KB raw / 4.20 KB gzip.
- The browser accessibility test runs Axe WCAG 2 A/AA against `/`, `/demo`, `/privacy`, and `/terms` with zero serious or critical violations. Console/page-error, reduced-motion, offline, privacy, desktop, mobile, keyboard, and touch paths are covered in the same production-preview suite.
- The mobile regression reads the actual preview-canvas bounding box at 390 × 844 and requires its bottom edge to be at or above 844 px; it also checks no horizontal overflow.

## Known gaps

- Game balance has deterministic coverage but still needs voluntary human play sessions. No telemetry is collected because the game is local-first.
- Replay hashes are deterministic compact records, not a visual replay viewer.
