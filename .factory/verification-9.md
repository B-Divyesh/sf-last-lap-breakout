# Independent verification 9 — PASS

Candidate `6cb6d3a9f92590fecc8b7289f04e106721ba3206` was independently verified on 2026-09-02 from the supplied clean checkout and against `https://last-lap-breakout.sociobot.in`.

## Decision

**PASS.** The prior release blocker is resolved. Every required claim command passes, the complete repository gate passes, production is byte-identical to the candidate build, and a non-accelerated live run reaches the real eighth-lap end screen. No critical, high, or medium defect was found.

## Mandatory first checks

`.factory/claims.json` exists and declares 18 claims. The first literal claim invocation on the untouched clone could not resolve the repository's not-yet-installed `@playwright/test`; after the required clean `npm ci`, all 18 commands were restarted from the beginning and run exactly as listed:

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
| `frame-rate` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `reduced-motion` | PASS |

The landing page, game screens, privacy/terms pages, and README were cross-checked against the manifest. No unlisted user-facing capability or privacy claim was found.

## First-read result

**PASS.** A cold live visit answers the required questions in plain words:

- What: **“Finish a Breakout run in eight minutes.”**
- For whom: **“For short breaks.”**
- First action: **“Try it with sample data,”** alongside **“A sample run starts immediately.”**

The untouched desktop and 390 × 844 first viewports show the game board itself, not a menu wall. On mobile, the board, headline, audience sentence, and one-click sample action all fit in the first viewport. There is no horizontal overflow.

## Clean-checkout gates

- Starting HEAD: `6cb6d3a9f92590fecc8b7289f04e106721ba3206`; worktree clean.
- `npm ci`: PASS — 61 packages installed and 0 vulnerabilities reported.
- `npm test`: PASS — 8/8 Vitest tests and 28/28 Playwright tests.
- `npx tsc --noEmit`: PASS.
- No lint script is defined in `package.json`.
- `npm run build`: PASS; the exact TypeScript/Vite production build produced `dist/`.
- Main JavaScript: 28,585 bytes raw / 10,391 bytes gzip. Supporting JavaScript: 1,727 bytes raw / 974 bytes gzip. CSS: 15,925 bytes raw / 4,391 bytes gzip. Font: 32,220 bytes. Mobile AVIF: 33,560 bytes. Total `dist/`: 326,963 bytes.

## Live game run and recovery

- Started from the cold title page using the single **Try it with sample data** action. The deployed hostname ignored `?test=1` as designed; the run used eight real 60-second clocks.
- A deterministic keyboard steering script kept the visible paddle under the orb for **481.395 seconds**. Laps 1–7 each ended with exactly three modifier choices. Choosing the first option each time advanced through all seven drafts.
- Lap 8 showed the guarded **Final core** and reached the real **Run complete** screen with **14,369 points**, four hull, and build code `LLB-7B4T5S-CEBQHDW-0MXK6F5`.
- **Copy build code** put that exact value on the clipboard. **Start another run** reset to lap 1, time 60, score `000000`, four hull, and playing state.
- A separate unattended live run reached **Hull depleted** on lap 1 in 18.882 seconds with zero hull. Pause was unavailable on the terminal screen; restart restored the complete initial state.
- Pause/reload recovery preserved tick 85, lap 1, time 59, score 35, and four hull. The remapped Escape key resumed the restored run.
- Stored assist, mute, screen-movement, and J/L/Escape settings survived reload. Starting a new run with assist enabled showed five hull.
- Malformed run JSON and wrong-type/invalid settings and best-result values recovered to a fresh lap 1 with default settings and no page error.
- Actual 390 px input checks passed: ArrowRight moved paddle position 0.500 → 0.634; an on-screen touch hold moved it 0.634 → 0.262; a touch drag placed it at 0.750.
- The full winning flow issued six requests, all to the product origin, and emitted no console or page error.

## Accessibility and responsive behavior

- `/opt/fleet/lib/verify-url.sh` passed the live root: HTTPS 200, title, `lang="en"`, one h1, main landmark, complete image alt coverage, named buttons, and no console errors. Its measured load was 667 ms in this environment.
- Independent axe WCAG 2 A/AA scans found zero serious/critical issues on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404 at both 1366 × 900 and 390 × 844.
- Every audited route has one `<main>`, one `<h1>`, `lang="en"`, a route-specific title, zero missing image alt attributes, and zero horizontal overflow. No visible link, button, input, or select measured below 44 × 44 CSS px.
- Keyboard traversal reaches the skip link first, demo controls, navigation, canvas, pause, settings, and touch controls. Each receives a 3 px gold focus outline. Opening settings by Enter focuses Assist mode; Escape closes it and restores focus to **Game settings**. No keyboard trap was found.
- With `prefers-reduced-motion: reduce`, transition duration is 0.01 ms, star offset stays `0.000`, and a real brick hit records no shake.
- Background visibility handling freezes the simulation and shows **Your lap is saved**; the observed tick remained fixed.

## Privacy, PWA, routes, and headers

- Cold-page and complete-run request logs contain only `https://last-lap-breakout.sociobot.in` resources. No analytics, ads, account, payment, iframe, third-party script/font, or personal-data endpoint appeared.
- During demo use, only `demo:last-lap-breakout:*` session keys were created; the pre-existing real settings key was untouched. **Reset demo** removed demo keys, and **Start for real** left no demo keys.
- Service-worker update found the current `/sw.js` active with no waiting or installing worker and one cache, `last-lap-breakout-v4`. `/demo` then reloaded offline with status 200, its correct title/h1, canvas, and no browser error.
- `/`, `/demo`, `/play`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200. The designed unknown route returns 404. All same-origin navigation links resolve as intended; the external factory link was identified but not fetched because it is outside this work order's resource scope.
- HTTP redirects to HTTPS. Browser response headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial.
- HTML uses `public, must-revalidate, max-age=30`; hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` uses the short revalidation policy.
- This is a static, account-free browser game with no server endpoint, unlock call, billing, sign-in, AI runtime, library, or CLI. API rate-limit/429, Entra authority, backend concurrency, and consumer-package checks do not apply.

## Deployment identity and measured performance

- All **19/19** publicly served build files byte-match the fresh candidate `dist/` output.
- Representative SHA-256 values: `index.html` `c550849e000a81fb058442eff03c735a6371302349ef9d997104e13115f5f674`; `build/main-9ZVc0NGn.js` `80518cf91f9138220d4034d7ab20882c4ec4878a149213ff72191d26f09b28a8`; `build/style-D1Uo2pRS.css` `5c7c914a545ef278526d8b31263928d38e8bc164af2dee2ea954223fabb5483e`; `sw.js` `4ac8f70f54a98aff839415f663997002dbf40882f1df7a0e0ebeebfdb3dfe7a7`.
- Independent live frame sample at 390 × 844, DPR 2, touch/mobile emulation, and 4× CPU throttle: 180 warm-up frames plus 900 active-play samples; median **16.7 ms**, p90 **16.7 ms**, p95 **16.7 ms**, maximum 83.3 ms, 3/900 intervals over 34 ms. The run remained in playing state. This passes the published median 14–18 ms and p90 ≤34 ms claim.
- Lighthouse 12.8.2 mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.053 s, LCP 1.218 s, TBT 129 ms, CLS 0.00016, total transfer 83,431 bytes.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: `.factory/design.md` records the Rail token as `#293052`, while the shipped `--rail` token is `#4b5686`. This is documentation drift only; the implemented color passed automated contrast/accessibility checks.

## Final result

**PASS.** Candidate `6cb6d3a9f92590fecc8b7289f04e106721ba3206` satisfies the researched browser-game contract at the tested production URL. The former frame-rate blocker is fixed and independently reproduced under the declared profile.
