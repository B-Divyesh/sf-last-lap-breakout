# Last Lap Breakout handoff

## Independent verification 2 — FAIL (2026-09-01)

Candidate `31ec06a27334bf05d85fe67ed083d67a0cb771c7` was tested locally and at `https://last-lap-breakout.sociobot.in`. The live HTML, JS, CSS, and service worker match the candidate byte-for-byte. Full details and screenshots are in [verification-2.md](verification-2.md).

Release blockers:

- At 390 × 844 the live game is visible, but **Try it with sample data** starts at y=869.98 and is outside the first viewport, so the required first action is missing from the cold first screen.
- `/privacy` says a best result is stored, but a completed real run leaves local storage empty; no best-result storage exists.
- Header, footer, and demo-banner controls measure 20–31.69 px high instead of the required 44 px minimum.
- The required measured 60-fps claim/test is absent from `.factory/claims.json` (independent measurement itself was approximately 60.00 fps).

Additional defects: structurally incomplete saved-run JSON can stop the animation with a page error; unknown routes render the 404 UI with HTTP 200; keyboard controls are not remappable.

Passing evidence: after `npm ci`, all six declared claim commands passed; `npm test` passed 6/6 unit and 10/10 browser tests; `npx tsc --noEmit` and `npm run build` passed; Lighthouse scored 93/100/100/100; Axe found no serious/critical issues; normal live flows made only same-origin requests; service-worker update/offline reload passed; and deterministic win, loss, restart, settings, keyboard, and touch flows worked. Do not release until the blockers above are repaired and independently reverified.

## Builder repair status — superseded by verification 2 (2026-09-01)

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
- `npx playwright test --grep @claim:demo-sandbox` also passed as the standalone declared claim command from the clean build path.

## Deployment and live evidence

- Deployed the `dist/` output to the scoped production Static Web App `sf-last-lap-breakout` on 2026-09-01.
- `https://last-lap-breakout.sociobot.in` serves the new bundle and passed `verify-url.sh`: HTTP 200, 654 ms network-idle load, no console errors, title present, `lang="en"`, one main landmark, one h1, no missing image alt text, and no unlabeled buttons.
- Live header checks confirm the configured CSP, `Referrer-Policy`, `X-Content-Type-Options`, and `Permissions-Policy`.
- A fresh live 390 × 844 Chromium context preloaded real settings, opened `/demo`, and verified that the real setting was ignored and unchanged while demo settings were written only to `demo:last-lap-breakout:settings:v1`. The live landing canvas bottom was 426 px (within the 844 px cold viewport), with no console errors.

## Known gaps

- Game balance has deterministic coverage but still needs voluntary human play sessions. No telemetry is collected because the game is local-first.
- Replay hashes are deterministic compact records, not a visual replay viewer.
