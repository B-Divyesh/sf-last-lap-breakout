# Independent verification 7 — FAIL

Candidate `95e9d32892b5c4708773241bf46c2767bb5fca03` was independently verified on 2026-09-02 from the clean supplied checkout and against `https://last-lap-breakout.sociobot.in`.

## Decision

**FAIL.** The exact `frame-rate` claim command failed during the mandatory claim sweep, and the same test failed again inside `npm test`. The acceptance contract makes any failing claim test release-blocking. The deployed game otherwise matches the candidate and passed the functional, accessibility, privacy, PWA, security, responsive, and live performance checks below.

No product code was changed during verification.

## Release-blocking finding

### High — the required frame-rate claim is not reliable in the clean local gate

Exact command: `npx playwright test --grep @claim:frame-rate`

- Mandatory first run: **FAIL**. Median stayed within the required 14–18 ms range, but p90 was **50 ms**, above the claimed maximum of **34 ms**.
- Full `npm test`: **FAIL** for the same assertion with p90 **50 ms**; 26 of the other 26 browser tests passed.
- A later isolated diagnostic rerun passed at median **16.7 ms**, p90 **33.4 ms**. This does not erase either required failure; it confirms the check is intermittent in the clean local environment.
- Three independent live runs at 390 × 844, touch/mobile emulation, device scale factor 2, and 4× CPU throttling each passed: median **16.7 ms**, p90 **16.7 ms**; means were 16.777, 16.833, and 16.999 ms.

The live game currently renders smoothly, but the repository cannot reliably prove its published quantitative claim and its required `npm test` gate does not pass. Stabilize the measured scenario or remove/change the claim, then demonstrate repeated clean passes of both the exact claim command and `npm test`.

## Mandatory first checks

`.factory/claims.json` exists with 18 unique IDs. Each ID occurs in exactly one `@claim:<id>` test and there are no unlisted claim tags.

| Claim | Exact manifest command result |
| --- | --- |
| `finite-run` | PASS — 1 test, 13.7 s |
| `demo-sandbox` | PASS — 1 test, 13.2 s |
| `assist-mode` | PASS — 1 test, 10.2 s |
| `modifier-effects` | PASS — 1 test, 9.3 s |
| `key-remapping` | PASS — 1 test, 13.2 s |
| `deterministic-build` | PASS — 1 test, 14.1 s |
| `copy-build` | PASS — 1 test, 17.0 s |
| `hull-loss` | PASS — 1 test, 9.3 s |
| `input-parity` | PASS — 1 test, 10.4 s |
| `canvas-drag` | PASS — 1 test, 9.9 s |
| `default-pause` | PASS — 1 test, 10.2 s |
| `local-recovery` | PASS — 1 test, 12.6 s |
| `autosave-cadence` | PASS — 1 test, 11.2 s |
| `best-result` | PASS — 1 test, 12.1 s |
| `frame-rate` | **FAIL — p90 50 ms, required ≤34 ms** |
| `local-privacy` | PASS — 1 test, 10.0 s |
| `offline-reload` | PASS — 1 test, 10.3 s |
| `reduced-motion` | PASS — 1 test, 10.5 s |

The cold first-read gate passes at desktop and 390 × 844. The first screen says what it is — **“Finish a Breakout run in eight minutes”** — names the situation — **“For short breaks”** — and presents **“Try it with sample data”** beside **“A sample run starts immediately.”** The game board is visible before the copy rather than behind a menu. At 390 px, the board ends at y=418.3 and the primary action ends at y=729.8 in the 844 px viewport, with no horizontal overflow. Evidence: [desktop first screen](evidence/verification-7/root/screenshot-desktop.png) and [mobile first screen](evidence/verification-7/live-first-screen-mobile.png).

## Clean repository gates

- `npm ci`: PASS — 61 packages installed; 0 vulnerabilities reported.
- `npm test`: **FAIL** — 6/6 Vitest tests passed; 26/27 Playwright tests passed; only `@claim:frame-rate` failed at p90 50 ms.
- `npx tsc --noEmit`: PASS.
- No lint script is defined.
- `npm run build`: PASS — TypeScript and Vite produced `dist/`.
- Fresh build: main JavaScript 28,061 bytes raw / 10.18 kB gzip; supporting JavaScript 711 bytes; CSS 15,925 bytes raw / 4.39 kB gzip; font 32,220 bytes; mobile AVIF 33,560 bytes; total `dist/` 326,439 bytes.
- A cold mobile root load transferred 82,535 bytes of subresources. The JS, CSS, font, image, and total transfer budgets pass.

## Live deployment identity and routes

Every publicly served file in the fresh `dist/` byte-matches production. `staticwebapp.config.json` correctly returns the designed 404 when requested because Azure consumes it as deployment configuration rather than publishing it. Representative SHA-256 values:

- `index.html`: `bc31325d2747bd2b481b57402de7a9fbcf5622da6b1c721fb6e90fb3a748e056`
- `build/main-DL9GmtTU.js`: `c0fd0b7477c7ce8468736c261f31cafbfa4148e9d6631b5a85753648c65580e1`
- `build/style-D1Uo2pRS.css`: `5c7c914a545ef278526d8b31263928d38e8bc164af2dee2ea954223fabb5483e`
- `sw.js`: `4ac8f70f54a98aff839415f663997002dbf40882f1df7a0e0ebeebfdb3dfe7a7`
- `404.html`: `ac91547322be689d1c28f1614d4fed4ca5cac8e88d8094877fbf0decb1891c33`

`/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. `/missing-page` renders the designed not-found page with HTTP 404. All same-origin navigation links resolve. The 1200 × 630 social image, 180 × 180 touch icon, SVG favicon, robots file, sitemap, MIT license, README, privacy page, and terms page are present.

## End-to-end game evidence

- A fresh live browser opened the title screen, activated the one-click sample, moved the paddle, paused/resumed, changed isolated demo settings, crossed seven modifier drafts, entered lap eight, and reached the genuine **Run complete** UI. Each draft presented exactly three modifiers; number-key and button selection were both exercised.
- The chosen path was `steady`, `guard`, `bonus`, `split`, `quick`, `magnet`, `wide`. Lap eight contained one 12-HP boss core and ten 2-HP guards. The result was 5,500 points with build `LLB-7B4T5S-CGBEQMW-1IBOQEL`.
- **Copy build code** put the displayed code on the clipboard. **Start another run** reset lap, score, perks, and terminal state; the saved Assist setting correctly gave the new run five hull.
- A separate live real-mode win saved 5,500 points and build `LLB-QQER7K-EGBHMQW-1155MVM` as the best result; that record survived reload.
- A one-hull missed-orb boundary reached **Hull depleted**, hid Pause, and restart returned to lap 1 with zero score and no modifiers. Evidence: [win screen](evidence/verification-7/live-win.png) and [loss screen](evidence/verification-7/live-loss.png).
- The live script advanced each persisted timer to its final fixed step after pausing. The passing `finite-run` claim separately executes all 8 × 60 seconds through the deterministic core and asserts exactly 480 elapsed seconds.
- A real run autosaved at lap 1 with 58.717 seconds, tick 77, score 35, and four hull. Reload restored the same tick and state. Assist, mute, H/K movement, and Escape pause settings persisted.
- Malformed JSON, a structurally incomplete run, and an out-of-range lap 9 save each recovered to a fresh playable lap 1 without a page error.
- Opening Game settings froze both time and simulation tick for 1.6 seconds; closing it resumed play.

## Inputs, mobile, keyboard, and accessibility

- Desktop and 390 × 844 checks covered `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. Axe WCAG 2 A/AA found zero serious or critical violations on all 12 route/viewport combinations.
- Every checked page has `lang="en"`, one `<main>`, one `<h1>`, a route-specific title, and no horizontal overflow.
- The first Tab reaches the skip link. Keyboard focus uses a 3 px gold outline with 4 px offset on links, buttons, canvas, and settings fields. Opening settings moves focus to Assist mode; Escape closes the dialog and returns focus to **Game settings**.
- ArrowRight moved the paddle from 0.500 to 0.614. On a real 390 px touch context, holding the right control moved it from 0.500 to 0.655 and a touch drag moved it to 0.750. No visible interactive target measured below 44 × 44 CSS px.
- Reduced-motion emulation matches and reduces button transitions to 0.01 ms; the claim test also verifies fixed stars and no collision shake.
- The factory URL verifier passes both `/` and `/?demo=1`: HTTP 200, titles, `lang`, h1/main, image alt coverage, button names, and no console errors.

## Privacy, security, caching, PWA, and performance

- The full live winning flow made 46 requests, all to `https://last-lap-breakout.sociobot.in`; none failed and no console/page error occurred. Demo changes stayed in `demo:` session keys and did not read or change a preloaded real setting.
- Playwright response headers confirm a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial.
- HTML and `sw.js` use `public, must-revalidate, max-age=30`; hashed JavaScript and CSS use `public, max-age=31536000, immutable`.
- The service worker updated to an active controller with no waiting or installing worker and only cache `last-lap-breakout-v4`. `/demo` then reloaded offline with its correct title, demo banner, and canvas.
- Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.191 s, LCP 1.362 s, TBT 73.5 ms, CLS 0.00016, transfer 83,244 bytes. Evidence: [Lighthouse JSON](evidence/verification-7/lighthouse.json).
- This is a static, account-free game. It has no server-side endpoint, unlock call, payment, sign-in, AI runtime, library package, or CLI. API allowance/429, Entra authority, backend concurrency/persistence, and consumer-package checks are not applicable.

## Defects by severity

- Critical: none.
- High: one — intermittent failure of the required frame-rate claim and therefore of `npm test`.
- Medium: none.
- Low: none.
