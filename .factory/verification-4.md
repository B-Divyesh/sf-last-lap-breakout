# Independent verification 4 — FAIL

Candidate `c694889148256590eaeb90192819607f03a2e3ac` was verified on 2026-09-02 from a clean checkout and against `https://last-lap-breakout.sociobot.in`. The live HTML, 404 document, service worker, main JavaScript, shared JavaScript, and CSS match the fresh local production build byte for byte.

## Decision

**FAIL.** The game itself works from title through both real end states, but a mandatory claim test and therefore `npm test` fail repeatedly. The claims manifest also omits two advertised input promises, and one declared recovery test does not prove all of its wording. The claims contract makes either issue release-blocking.

## Release-blocking findings

### High — the required 60 fps claim fails its own test and the repository quality gate

The exact manifest command `npx playwright test --grep @claim:frame-rate` failed three times in this clean installed checkout:

- During the required one-by-one claim run: mean frame interval **20.462 ms**, versus the asserted maximum of 18 ms (about 48.9 fps).
- During `npm test`: mean **19.907 ms** (about 50.2 fps); the suite ended with 23/24 browser tests passing.
- In a later isolated rerun: mean **21.296 ms** (about 47.0 fps).

Each failure is at `tests/e2e/claims.spec.ts:294` in the specified 390 × 844, touch/mobile, 4× CPU-throttled context. Playwright retained `test-results/claims--claim-frame-rate-t-7ae6b-nce-under-4x-CPU-throttling-chromium/trace.zip` and its failure screenshot for the final rerun.

Three independent measurements of the live deployment under the same emulation passed at 16.851, 16.759, and 17.037 ms mean (59.34, 59.67, and 58.70 fps). That suggests harness/load sensitivity, but it does not override the explicit rule that every exact claim command and `npm test` must pass from the clean clone. The README's unqualified “60 fps frame cadence” statement remains unsupported by the required release gate in this environment.

### High — advertised controls are missing claim entries, and recovery proof is incomplete

The README advertises **“Drag on the playfield”** and **“Pause with P”** (`README.md`, Controls), while the in-game help also says **“Pause: P”**. Neither promise appears in `.factory/claims.json`:

- `input-parity` moves through an on-screen control; it does not test canvas dragging.
- `key-remapping` changes pause to Escape before testing it; it does not test the advertised default P binding.

In addition, `local-recovery` claims that run progress survives reload. Its tagged test confirms that a stored record exists before reload, but after reload it asserts only the mute setting; it never compares restored lap, time/tick, score, hull, or other progress. The claim contract requires the tagged test to assert the promised observable result.

The manifest itself is structurally sound: 15 unique IDs each have exactly one matching `@claim:` test tag. The defect is missing/narrow behavioral coverage, not duplicate tags.

## Mandatory first checks

`.factory/claims.json` exists with 15 entries. Literal commands before dependency installation all stopped because `@playwright/test` was not installed in the clean clone. After `npm ci` installed the locked 61 packages with zero reported vulnerabilities, every exact command was run independently from the configured production-preview/demo entry point:

| Claim | Result |
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
| `local-recovery` | PASS, with the proof gap above |
| `best-result` | PASS |
| `frame-rate` | **FAIL — 20.462 ms mean** |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `reduced-motion` | PASS |

The cold first-read gate passes on desktop and 390 × 844 mobile. The first screen says **“Finish a Breakout run in eight minutes,”** identifies people on short breaks, explains the eight laps/modifiers, and shows **“Try it with sample data”** plus **“A seeded run starts immediately.”** The sample board is visible in the first viewport. On mobile, the board ends at y=418.26 and the demo action ends at y=729.80, with no horizontal overflow.

## Build and automated checks

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- `npm test`: **FAIL**; 6/6 Vitest tests passed and 23/24 Playwright tests passed. The only runtime failure was `@claim:frame-rate` at 19.907 ms mean.
- `npx tsc --noEmit`: PASS.
- No lint script is defined.
- `npm run build`: PASS; TypeScript and Vite produced `dist/`.
- Initial assets pass budgets: main JS 27,163 bytes raw / 9.95 KB gzip, total emitted JS 28,890 bytes raw, CSS 15,925 bytes raw / 4.39 KB gzip, font 32,220 bytes, mobile AVIF 33,560 bytes, and total `dist/` 368 KB.
- Mobile Lighthouse 12.8.2: performance 97, accessibility 100, best practices 100, SEO 100; LCP 1.277 s, TBT 181 ms, CLS 0.00016, total transfer 82,409 bytes, JS transfer 10,649 bytes.

## End-to-end game evidence

A fresh live context started at the title, entered real play at lap 1 with 60 seconds, zero score, and four hull, then traversed all eight production laps. To keep verification bounded, each paused, persisted lap was moved to its final timer boundary before reload; no localhost-only `?test=1` acceleration ran. Each of laps 1–7 displayed exactly three modifier choices. Lap eight reached the real **Run complete** UI with 4,935 points and build `LLB-QJ4S9M-HWCGBQD-0MQQ9MZ`.

- **Copy build string** reported success.
- The best-result record stored the same score/build and survived restart.
- **Start another run** reset lap/time/score to 1/60/0. Persisted Assist mode correctly started it with five hull.
- A separate one-hull boundary run missed one orb and reached **Hull depleted**; Pause was absent at the terminal state. Restart reset the run.
- ArrowRight moved the paddle from 0.500 to 0.614. A real CDP touch hold on the mobile left control moved it from 0.500 to 0.345.
- Settings paused the timer for 1.6 seconds, stored Assist and J/L/Escape mappings, and showed the designed 3 px gold focus indicator on every select.
- Malformed JSON run storage recovered to a fresh lap without a page error. The repository test also rejects a structurally incomplete valid-JSON run.

This verifies the goal, challenge, win/loss conditions, restart reset, settings/best-result persistence, modifier choices, keyboard and touch controls, and both end screens. The frame-rate release claim remains failed as documented above.

## Live deployment, privacy, accessibility, and PWA

- Local/live SHA-256 matches: HTML `0a9e15ad…20254`, 404 `05037e91…5c2d3`, service worker `4ac8f70f…fe7a7`, main JS `52ebbdbc…6801b`, shared JS `d2a32840…57d0`, and CSS `5c7c914a…5483e`.
- The full live winning/loss/recovery flow made 56 requests, all to `https://last-lap-breakout.sociobot.in`; there were no failed requests, console errors, or page errors.
- Root response headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a camera/microphone/geolocation/payment-denying Permissions Policy.
- HTML and `sw.js` revalidate after 30 seconds. Hashed JS/CSS return `public, max-age=31536000, immutable`.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200; `/missing-page` returns the designed 404 with HTTP 404. Each route has a route-specific title, one h1, and one main landmark.
- `verify-url.sh` passes: HTTPS 200, 755 ms network-idle load, `lang=en`, title/main/h1/alt/button labels present, and no console errors.
- Independent Axe WCAG 2 A/AA scans at desktop and mobile sizes found zero serious or critical findings on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`.
- At 390 px, all measured header, demo, game-action, and touch targets are at least 44 px high and wide where applicable. Keyboard focus is a visible 3 px gold outline; the native settings dialog moves focus to its first control and returns focus to its opener.
- Reduced-motion, service-worker update, and offline reload checks pass. The active worker controls `/demo`, has no waiting update, uses cache `last-lap-breakout-v4`, and reloads the heading, demo banner, and canvas offline.
- The product is static and has no server-side endpoint, product-unlock call, sign-in, billing, or AI feature. Rate-limit/429 and Entra-authority checks are therefore not applicable.

## Required repair and rerun

Make the declared 4×-CPU mobile frame check pass reliably without weakening the visitor-facing claim, then run every exact claim command and `npm test` from a fresh install. Add manifest-tagged tests for canvas dragging and default P pause, and make `local-recovery` assert restored run progress after reload. Recheck live identity and the complete browser matrix before release.

No product code was changed during this verification.
