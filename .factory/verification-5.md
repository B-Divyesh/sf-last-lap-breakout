# Independent verification 5 — FAIL

Candidate `399acadd2a87d8c8c2740e084052cc505979f38d` was verified on 2026-09-02 from a clean checkout and against `https://last-lap-breakout.sociobot.in`.

## Decision

**FAIL.** The deployed game matches the candidate and works from its first screen through win, loss, restart, persistence, offline reload, keyboard, and touch flows. However, one mandatory claim test fails reproducibly, causing `npm test` to fail. The live game also advertises an exact one-second autosave promise that has no claim entry or dedicated tagged test. Either claims-contract failure is release-blocking.

No product code was changed during verification.

## Release-blocking findings

### High — the required local-recovery claim fails its exact test and the repository gate

The exact manifest command `npx playwright test --grep @claim:local-recovery` failed during the required one-by-one claims run:

- saved tick ceiling: `< 95`
- restored tick observed: `100`
- failure: `tests/e2e/claims.spec.ts:287`

The same test failed again in the full `npm test` run:

- saved tick ceiling: `< 95`
- restored tick observed: `101`
- result: 6/6 Vitest tests passed; 25/26 Playwright tests passed

The product changes a restored `paused` run to `playing` while mounting. The test then focuses the canvas and presses P before checking the restored tick. On this worker, 15–16 simulation ticks elapse during reload and interaction, beyond the test's allowed drift of fewer than 10 ticks. An independent live sample restored lap 1, time 59, score 35, four hull, and tick 75 at tick 83, so no data loss was observed in that sample. This does not override the contract: every exact command in `.factory/claims.json` and `npm test` must pass from the clean candidate.

Required repair: align reload behavior and the observable claim proof so the exact tagged test passes reliably without weakening the user-facing recovery promise, then rerun every claim separately and the full suite from a clean install.

### High — “Progress saves after each second” is an unlisted quantitative claim

The live `/play` and `/demo` run guide says: **“Progress saves after each second. Refresh to return to the same lap.”** The recovery claim covers restoring progress, but it does not claim or prove the one-second autosave interval. Its test presses P, which explicitly saves the run, before reading storage.

Required repair: add an `autosave-cadence` entry and exactly one `@claim:autosave-cadence` test that observes an automatic storage update without pausing, or remove the exact one-second promise.

## Mandatory first checks

`.factory/claims.json` exists. After `npm ci` installed the locked 61 packages with zero vulnerabilities, every listed command was run independently before other product inspection. The manifest has 17 unique IDs and exactly one matching test tag per ID.

| Claim | Exact command result |
| --- | --- |
| `finite-run` | PASS |
| `demo-sandbox` | PASS |
| `assist-mode` | PASS |
| `modifier-effects` | PASS |
| `key-remapping` | PASS |
| `deterministic-build` | PASS |
| `copy-build` | PASS |
| `hull-loss` | PASS |
| `input-parity` | PASS |
| `canvas-drag` | PASS |
| `default-pause` | PASS |
| `local-recovery` | **FAIL — restored tick 100, required below 95** |
| `best-result` | PASS |
| `frame-rate` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `reduced-motion` | PASS |

The cold first-read gate passes on desktop and 390 × 844 mobile. The screen says **“Finish a Breakout run in eight minutes,”** names people on short breaks, explains the eight laps and modifier choices, and presents **“Try it with sample data”** with **“A seeded run starts immediately.”** The game board itself is visible in the first viewport. On mobile the canvas ends at y=418.26 and the demo action ends at y=729.80. Evidence: `verification-5-first-screen-desktop.png` and `verification-5-first-screen-mobile.png`.

## Build and repository gates

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- Every exact claim command: **16 PASS, 1 FAIL** as listed above.
- `npm test`: **FAIL**; 6/6 Vitest tests and 25/26 Playwright tests passed. Only `@claim:local-recovery` failed.
- `npx tsc --noEmit`: PASS.
- No lint script is defined.
- `npm run build`: PASS; TypeScript and Vite produced `dist/`.
- Initial home JavaScript: 27,932 bytes raw / 10,360 bytes gzip. CSS: 15,925 bytes raw / 4,365 bytes gzip. Font: 32,220 bytes. Mobile AVIF: 33,560 bytes. Total `dist/`: 318,440 bytes. All are within the stated budgets.

## Live build identity and routing

All 15 publicly served build payloads byte-match the fresh candidate build, including HTML, 404, service worker, all JavaScript/CSS chunks, images, font, icons, robots, and sitemap. Representative SHA-256 prefixes are:

- `index.html`: `2a13d8afb7813ceb`
- main JavaScript: `ead34b89ce696092`
- CSS: `5c7c914a545ef278`
- `404.html`: `05037e91bc6a9747`
- service worker: `4ac8f70f54a98aff`

`staticwebapp.config.json` is deployment configuration and is not publicly served; its effects are present in routing, cache, and security headers.

`/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. `/missing-page` returns the designed page with HTTP 404. Each route has a route-specific title, one h1, one main landmark, and no horizontal overflow at desktop or 390px. Same-origin navigation links resolve successfully. The external factory footer link was not followed because it is outside this work order's product boundary.

## End-to-end game evidence

A fresh live browser opened the title screen, activated the one-click demo, moved the paddle by keyboard, and traversed the production eight-lap flow. The verifier paused each active lap, moved only its persisted timer to the boundary, reloaded, and used the real runtime to enter each draft and terminal state; the deployed hostname ignores the local `?test=1` accelerator.

- Laps 1–7 each displayed exactly three modifiers and accepted keys 1–3.
- Lap 8 displayed the final core and reached the real **Run complete** screen.
- Result: 4,950 points; build `LLB-7B4T5S-DGCWEBM-1ESLLXV`.
- **Copy build string** reported `Build string copied.` A denied-clipboard run recovered with `Copy failed. Select the build string instead.`
- Restart reset lap/time/score to 1/60/0. Persisted Assist mode produced five hull.
- A separate one-hull boundary miss reached **Hull depleted** and hid Pause. Restart settled at lap 1, 60 seconds, score 0, and four hull.
- A completed real run saved score 4,447 and build `LLB-QKVW0Z-EDMWHGB-1T1K833`; the best-result record matched and survived reload.
- Real settings persisted Assist, mute, J/L movement, and Escape pause through reload.
- Malformed JSON run storage recovered to a fresh 1/60 run with no page error.

Win/loss evidence: `verification-5-end-screen.png` and `verification-5-loss-screen-mobile.png`.

## Inputs, accessibility, and mobile

- Keyboard ArrowRight moved paddle position 0.500 → 0.614.
- A real CDP touch hold on the 173 × 58 mobile left control moved it 0.500 → 0.324.
- A touch drag across the canvas placed the paddle at 0.750.
- No visible interactive target measured below 44 × 44 on the 390px play screen; no horizontal overflow was present.
- Keyboard Tab reaches the skip link, navigation, canvas, Pause, settings, and footer. The skip link bypasses navigation to the first main action.
- Focus is a visible 3px gold outline. The native settings dialog moves focus to its first field, keeps background controls inert, and restores focus to the settings opener when closed.
- Independent Axe WCAG 2 A/AA scans found zero serious/critical findings on all six routes at 1366 × 900 and 390 × 844.
- Reduced-motion, semantic landmarks, labels, route titles, `lang=en`, decorative alt text, and the single-h1 rule passed. `/opt/fleet/lib/verify-url.sh` passed in 651 ms with no console errors or unlabeled buttons.

## Privacy, security, offline, and performance

- The complete live winning flow made 46 requests, all to `https://last-lap-breakout.sociobot.in`; none failed. There were no console or page errors.
- Demo activity left local storage empty and used only `demo:` session keys. The real run used local storage as documented.
- Root headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial.
- HTML and `sw.js` use 30-second revalidation; hashed build assets use `max-age=31536000, immutable`.
- The active service worker was activated and controlling, had no waiting/installing update, used only cache `last-lap-breakout-v4`, and reloaded `/demo` offline with its heading, banner, and canvas.
- Three independent live 390px, 4× CPU-throttled frame samples recorded 300 frames each: median 16.7 ms in all three; p90 16.7 ms in all three; means 16.666, 16.666, and 17.055 ms.
- Live mobile Lighthouse 12.8.2: performance 98, accessibility 100, best practices 100, SEO 100; FCP 1.080 s, LCP 1.305 s, TBT 142.5 ms, CLS 0.00016, total transfer 83,003 bytes.

This is a static, account-free browser game with no server-side product endpoint, product-unlock call, billing, sign-in, or AI feature. API 429/`Retry-After`, Entra authority, backend concurrency, and consumer-package checks are not applicable.
