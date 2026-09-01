# Independent verification 2 — FAIL

Candidate `31ec06a27334bf05d85fe67ed083d67a0cb771c7` was verified on 2026-09-01 against `https://last-lap-breakout.sociobot.in` and a clean local checkout. The live HTML, hashed JS, hashed CSS, and service worker have the same SHA-256 values as the fresh local production build.

## Decision

**FAIL.** The candidate has four release-blocking contract defects. The earlier demo-isolation, mobile-canvas, and test-runner defects are repaired, and the core game is playable through both ending states, but this candidate does not yet meet the full acceptance contract.

## Release-blocking defects

### High — the primary demo action is below the cold mobile viewport

At 390 × 844, the game canvas is visible from y=156.98 through y=426.27, so the screen correctly shows the game rather than a menu wall. The required **Try it with sample data** action starts at y=869.98 and ends at y=922.78, entirely below the 844 px first viewport. The visible nav item says only **Demo**.

The first viewport therefore explains what the game is and who it is for, but does not show the required plain-word first action or what happens after clicking. This fails the explicit first-read and demo-sandbox gate. Evidence: [qa-first-screen-mobile.png](qa-first-screen-mobile.png).

### High — the advertised best-result persistence does not exist

`/privacy` states: “The game stores your current run, settings, and best result in local storage.” The runtime has keys only for the in-progress run and settings. On win or loss it removes the run key and never writes a best-result key.

An accelerated real-mode production run reached **Run complete** and then returned `{}` for all local-storage entries. This is both an unlisted claim and a false privacy/data statement. It also misses the browser-game requirement that best scores persist locally.

### High — several mobile touch targets are under 44 px

Measured at 390 × 844:

- header wordmark: 26 px high;
- header **Demo** and **Privacy** links: 22 px high;
- demo banner **Reset demo** and **Start for real**: 31.69 px high;
- footer links: 20 px high.

The game controls themselves pass: pause/settings are 44 px high and left/right controls are 58 px. The undersized navigation and demo controls fail the non-negotiable 44 × 44 px accessibility baseline.

### High — the required frame-rate claim has no claim test

`.factory/claims.json` contains six claims but no measured frame-rate claim. The browser-game contract explicitly requires a test-backed “60 fps on a mid-range phone” claim. Independent live measurement was healthy—180 animation frames averaged 16.666 ms with p95 16.8 ms, approximately 60.00 fps—but the required claim and sandbox test are absent. Under the claims contract, the omission is release-blocking.

## Other defects

### Medium — a structurally incomplete saved run freezes play

A fresh live browser seeded with valid JSON `{"lap":1,"bricks":[]}` at `last-lap-breakout:v1` loaded the play screen and then raised `Cannot read properties of undefined (reading 'includes')`. The animation loop stopped. Malformed JSON such as `{broken` is recovered correctly, but `readRun()` validates only `lap` and `bricks`, not the rest of the persisted schema. Reject or migrate incomplete records before mounting the game.

### Medium — the designed 404 route returns HTTP 200

`GET /missing-page` renders the correct **This lap does not exist** UI and title, but the live response status is 200. The configured navigation fallback handles the request before the 404 response override. Unknown routes should retain the styled page while returning HTTP 404.

### Low — keyboard controls cannot be remapped

Arrow keys/A-D, P, and 1-3 all work as advertised, but the game exposes no remapping control. This misses the attached game-loop input requirement.

## Mandatory first checks

The claims manifest exists and lists six unique tests. Literal pre-install invocations could not load local `@playwright/test`, as expected in a clone with no `node_modules`. After `npm ci` (61 packages, 0 vulnerabilities), every exact manifest command passed independently:

| Claim | Exact command | Result |
| --- | --- | --- |
| Eight fixed laps reach a result/build string | `npx playwright test --grep @claim:finite-run` | PASS, 1 test, 10.6 s |
| Demo data uses a separate namespace | `npx playwright test --grep @claim:demo-sandbox` | PASS, 1 test, 10.7 s |
| Keyboard and touch both move the paddle | `npx playwright test --grep @claim:input-parity` | PASS, 1 test, 8.6 s |
| Run progress and settings survive reload | `npx playwright test --grep @claim:local-recovery` | PASS, 1 test, 10.2 s |
| Runtime requests remain same-origin | `npx playwright test --grep @claim:local-privacy` | PASS, 1 test, 8.3 s |
| Demo reloads offline after first visit | `npx playwright test --grep @claim:offline-reload` | PASS, 1 test, 9.2 s |

Desktop first-read passed at 1440 × 900. It shows **Finish a Breakout run in eight minutes**, says it is for short breaks, shows the active game preview, and exposes **Try it with sample data** plus “A seeded run starts immediately.” Keyboard activation opens `/demo` in one action. The mobile result is the blocker documented above.

## Build and repository gates

- `npm ci`: PASS; 61 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 6/6 Vitest tests and 10/10 Chromium tests.
- `npx tsc --noEmit`: PASS.
- No lint script is defined.
- `npm run build`: PASS; `dist/` produced.
- Initial production assets: JS 24.25 KB raw / 9.19 KB gzip; CSS 14.89 KB raw / 4.20 KB gzip; font 32.22 KB; mobile AVIF hero 33.56 KB. All stated budgets pass.
- Lighthouse 12.8.2 mobile: performance 93, accessibility 100, best practices 100, SEO 100; LCP 1.3 s, CLS 0, TBT 310 ms.

## Game and recovery evidence

- A deterministic scripted production-bundle run started at the title, entered active play at lap 1 with 60 seconds and four hull, completed all seven three-choice drafts using keys 1–3, and reached **Run complete** at lap 8. The tested choice path produced `LLB-7B4T5S-DGCWEBM-0Z4DPSF`. Evidence: [qa-end-screen.png](qa-end-screen.png).
- **Copy build string** reported success. **Start another run** removed the result and returned to lap 1.
- A separate fixed-step scripted run depleted the hull and reached **Hull depleted**. Restart returned to lap 1. Persisted assist mode changed the next run to five hull.
- Arrow-key input moved the live paddle from 0.500 to 0.624. The mobile left control moved it from 0.500 to 0.314. P and Space paused/resumed with the saved-lap overlay.
- A normal run saved after one second and resumed the same lap/tick after reload. Settings persisted. Corrupt non-JSON storage recovered to a new run; incomplete valid JSON fails as reported above.
- Demo settings were isolated in `demo:last-lap-breakout:settings:v1`; real settings were neither read nor changed. Reset cleared demo settings without touching real keys.

## Live deployment, privacy, accessibility, and PWA evidence

- SHA-256 matches: HTML `ba493380…a536`; JS `4f2693a5…9083e`; CSS `f162ac0a…ee9f`; service worker `d80fa043…c1d4` locally and live.
- Full live demo interaction requested only `https://last-lap-breakout.sociobot.in`; there were no third-party requests, failed responses, console errors, or page errors in normal flows.
- Root headers include a self-only CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy.
- HTML and `sw.js` use `public, must-revalidate, max-age=30`. Hashed JS/CSS use `public, max-age=31536000, immutable`.
- `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the not-found UI each have `lang="en"`, one `<main>`, one `<h1>`, route-specific titles, no horizontal overflow, and no normal-load console errors.
- Axe WCAG 2 A/AA found zero serious or critical violations on every tested route. The factory `verify-url.sh` passed: HTTP 200, 701 ms network-idle load, title/lang/main present, zero missing image alt attributes, zero unlabeled buttons, and no console errors.
- Keyboard focus is visible with a 3 px gold outline and 4 px offset. The skip link appears on focus and the primary demo action works with Enter.
- Reduced-motion mode removes the preview rotation and reduces animation/transition durations to 0.01 ms. No flashing behavior was found.
- Service worker update completed with `sw.js` active/controlling, cache `last-lap-breakout-v2`, no waiting worker, and successful offline reload of `/demo` with its heading and sandbox banner.
- All internal assets and documented routes returned successfully. The external factory link was not fetched because the work order forbids connecting to out-of-scope products.
- This is a static product with no server-side endpoints, so request-allowance/429 testing is not applicable. It has no sign-in, so Entra authority testing is not applicable. No AI feature is implied by this game brief.

## Required repair and rerun

Keep the live game preview in the 390 px first viewport while also placing the exact sample-data action and its immediate-result copy above the fold; expand all interactive hit areas to at least 44 × 44 px; either implement and test best-result persistence or correct the privacy copy; add the measured frame-rate claim/test; validate the complete persisted-run schema; return a real 404 status; and add key remapping. Then rerun every claim command, the full suite/build, the live hash comparison, and this browser matrix.
