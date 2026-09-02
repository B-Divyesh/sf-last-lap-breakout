# Independent verification 8 — FAIL

Candidate `416de04d3f3c7b840f1407849a69ce02629a6552` was independently verified on 2026-09-02 from the supplied clean checkout and against `https://last-lap-breakout.sociobot.in`.

## Decision

**FAIL.** The mandatory `frame-rate` claim failed in its exact standalone command and failed again in the complete `npm test` gate. Both failures measured a p90 frame interval near 50 ms against the published maximum of 34 ms. The acceptance contract makes any failing claim test release-blocking.

The deployed game is byte-identical to the candidate and otherwise passed the first-read, functional, accessibility, privacy, offline, security, responsive, and live performance checks below. No product code was changed.

## Release-blocking defect

### High — the required frame-rate claim still fails in the clean local gate

Exact command: `npx playwright test --grep @claim:frame-rate`

- Mandatory claim sweep: **FAIL** — median remained within 14–18 ms, but p90 was **50 ms**, above the claimed **≤34 ms**.
- Full `npm test`: **FAIL** again — p90 was **49.900000000001455 ms**; all 26 other Playwright tests passed.
- The failure is reproducible in two independent invocations in this verification. Its screenshot and trace were produced under `test-results/claims--claim-frame-rate-t-22526-nce-under-4x-CPU-throttling-chromium/`.
- The failure snapshot shows that the unattended frame test had already reached **Hull depleted** on lap 1 while it continued sampling. Regardless of cause, the declared test and required full suite do not pass.
- A separate fresh live measurement using the declared 390 × 844 viewport, DPR 2, touch/mobile emulation, 4× CPU throttle, 180 warm-up frames, and 900 samples passed at median **16.7 ms**, p90 **16.7 ms**, p95 **16.8 ms**, with 5/900 intervals above 34 ms and a 66.8 ms maximum.

The live build appears smooth, but a passing live sample cannot override two failures of the repository's required claim gate. The claim test must be made reliable without weakening the advertised bound, or the quantitative claim must be removed.

## Mandatory first checks

`.factory/claims.json` exists and contains 18 claims. The literal pre-install invocation was attempted first as ordered; it could not load local `@playwright/test` because a clean clone has no `node_modules`. After `npm ci`, every manifest command was run independently:

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
| `canvas-drag` | PASS |
| `default-pause` | PASS |
| `local-recovery` | PASS |
| `autosave-cadence` | PASS |
| `best-result` | PASS |
| `frame-rate` | **FAIL — p90 50 ms; required ≤34 ms** |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `reduced-motion` | PASS |

The landing page and README were cross-checked against the manifest. No unlisted product claim was found.

## First-read result

**PASS.** A cold live visit answers all three required questions in the first viewport:

- What: **“Finish a Breakout run in eight minutes.”**
- For whom: **“For short breaks.”**
- What to click: **“Try it with sample data”**, paired with **“A sample run starts immediately.”**

The desktop and 390 × 844 captures both show the game board itself, not a menu wall. On mobile, the board, explanation, and one-click sample action all appear within the first 844 px, with no horizontal overflow. Evidence: [desktop first screen](evidence/verification-8/first-screen-desktop.png) and [mobile first screen](evidence/verification-8/first-screen-mobile.png).

## Clean checkout gates

- Verified starting HEAD and candidate: `416de04d3f3c7b840f1407849a69ce02629a6552`; the tree was clean.
- `npm ci`: PASS — 61 packages installed; 0 vulnerabilities.
- `npm test`: **FAIL** — 8/8 Vitest tests passed; 26/27 Playwright tests passed; only `@claim:frame-rate` failed.
- `npx tsc --noEmit`: PASS.
- No lint script is defined in `package.json`.
- `npm run build`: PASS; TypeScript and Vite produced `dist/`.
- Main JavaScript: 28,061 bytes raw / 10,180 bytes gzip. Supporting JavaScript: 711 bytes raw / 399 bytes gzip. CSS: 15,925 bytes raw / 4,391 bytes gzip. Font: 32,220 bytes. Mobile AVIF: 33,560 bytes. Total `dist/`: 326,439 bytes. These are within the product budgets.

## Deployment identity, routes, and headers

All 19 publicly served files in the fresh `dist/` byte-match production. Representative SHA-256 values:

- `index.html`: `bc31325d2747bd2b481b57402de7a9fbcf5622da6b1c721fb6e90fb3a748e056`
- `build/main-DL9GmtTU.js`: `c0fd0b7477c7ce8468736c261f31cafbfa4148e9d6631b5a85753648c65580e1`
- `build/style-D1Uo2pRS.css`: `5c7c914a545ef278526d8b31263928d38e8bc164af2dee2ea954223fabb5483e`
- `sw.js`: `4ac8f70f54a98aff839415f663997002dbf40882f1df7a0e0ebeebfdb3dfe7a7`
- `404.html`: `ac91547322be689d1c28f1614d4fed4ca5cac8e88d8094877fbf0decb1891c33`

`/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. `/missing-page` returns the designed 404. Every navigation link, including the external Param Factory link, resolved as expected. HTTP redirects to HTTPS.

Live headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial. HTML and `sw.js` use `public, must-revalidate, max-age=30`; hashed JS/CSS use `public, max-age=31536000, immutable`.

## End-to-end game evidence

- A genuine live fixed-seed sample was started from the title screen using the one-click demo action. No production speed-up hook was used.
- A visual paddle script followed the rendered orb through all eight real 60-second laps. Laps 1–7 each ended at a draft with exactly three modifier choices. Key `1` selected the first modifier; later choices used their buttons.
- Lap 8 reached the real **Run complete** screen after its full 60 seconds with 12,815 points, four hull, and build code `LLB-7B4T5S-CEBQHDW-0JXLLOP`. Clipboard contents exactly matched the displayed code. Evidence: [end screen](evidence/verification-8/end-screen.png).
- The scripted run exercised the advertised challenge: keep the orb in play, survive fixed timers, choose seven build modifiers, and face the guarded final core. The passing deterministic core claim separately proves exactly 8 × 60 simulated seconds, one boss core, and ten guard bricks.
- A separate live no-catch run lost all four hull points, reached **Hull depleted** on lap 1 after 10.9 seconds, hid Pause, and displayed its score/build code. **Start another run** restored lap 1, time 60, score zero, four hull, centered paddle, and no terminal overlay.
- Pause froze the simulation at tick 76; reload restored the same paused tick and lap. Assist and mute settings persisted in real-run local storage. Malformed/out-of-range run, settings, and best-result storage recovered to a fresh lap 1 with defaults and no error.
- The demo win made six requests, all same-origin, and emitted no console or page error. On completion it left no local-storage keys and no demo session key.

## Inputs, accessibility, and responsive behavior

- At 390 px, ArrowRight moved the paddle from 0.500 to 0.624, a real touch-hold moved it from 0.500 to 0.355, and a real touch drag moved it to 0.750. The standalone keyboard, on-screen control, and canvas-drag claim tests also passed.
- The first Tab focuses **Skip to main content** with a 3 px solid gold outline. Opening Game settings focuses Assist mode; closing returns focus to **Game settings**. No keyboard trap was found.
- Desktop and 390 × 844 audits covered `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. Each has `lang="en"`, one `<main>`, one `<h1>`, a route-specific title, and no horizontal overflow. Axe WCAG 2 A/AA reported zero serious or critical findings in all 12 route/viewport combinations. No visible interactive target measured below 44 × 44 CSS px.
- Valid routes emitted no console/page errors. The deliberate `/missing-page` navigation produced only Chromium's expected failed-resource console entry for the HTTP 404 document itself.
- With reduced motion, star offset stayed at `0.000` and transition duration was 0.01 ms. The full reduced-motion claim also passed its real-hit/no-shake assertion.

## Privacy, offline behavior, and performance

- Cold landing and full winning-flow request logs contained only `https://last-lap-breakout.sociobot.in` resources. No analytics, advertising, account, payment, iframe, or third-party request was present.
- Demo storage is session-scoped and separate from real local storage. The exact reset/start-for-real isolation claim passed.
- Service-worker update found an active controller, no waiting/installing worker, and only cache `last-lap-breakout-v4`. `/demo` then reloaded offline with HTTP 200, the correct title and heading, and a visible canvas.
- Lighthouse 12.8.2 mobile: Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.052 s, LCP 1.277 s, TBT 225 ms, CLS 0.00016, total transfer 83,292 bytes. Evidence: [Lighthouse JSON](evidence/verification-8/lighthouse.json).
- This is a static, account-free browser game. It has no backend endpoint, product-unlock call, payment, sign-in, AI runtime, package, or CLI. API rate-limit/429, Entra authority, backend concurrency/persistence, and consumer-package checks do not apply.

## Defects by severity

- Critical: none.
- High: one — required `frame-rate` claim and therefore `npm test` fail reproducibly in the clean local gate.
- Medium: none.
- Low: none.

## Required next step

Make the declared 390 px / 4× CPU frame test reliably satisfy its existing 14–18 ms median and ≤34 ms p90 bound in a clean worker, without weakening the claim merely to pass. Then rerun all 18 exact claim commands and the complete `npm test` gate from a clean clone.
