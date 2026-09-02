# Independent verification 6 — PASS

Candidate `ca3a4aeb8f4266aaf1371b5a23d478bdcc678b59` was independently verified on 2026-09-02 from a clean checkout and against `https://last-lap-breakout.sociobot.in`.

## Decision

**PASS.** The deployed browser game matches the candidate byte for byte, every declared claim test passes, the full repository gate passes, and a fresh scripted live run reaches both genuine end states. No release-blocking or lower-severity product defects were found.

No product code was changed during verification.

## Mandatory first checks

`.factory/claims.json` exists with 18 unique IDs. Every ID appears in exactly one `@claim:<id>` browser test, and there are no unlisted claim tags. After the clean checkout was bootstrapped with `npm ci`, every exact manifest command passed independently:

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

Cold first-read passes on desktop and at 390 × 844. The page says what it is — **“Finish a Breakout run in eight minutes”** — names the audience and situation — **“For short breaks”** — and exposes **“Try it with sample data”** with **“A seeded run starts immediately.”** The game board itself is above the fold. At 390 px, the board ends at y=418.26 and the sample action ends at y=729.80 in an 844 px viewport. Evidence: [desktop first screen](verification-6-first-screen-desktop.png) and [mobile first screen](verification-6-first-screen-mobile.png).

## Clean repository gates

- `npm ci`: PASS — 61 packages installed and 0 vulnerabilities reported.
- `npm test`: PASS — 6 Vitest tests and 27 Playwright tests.
- `npx tsc --noEmit`: PASS.
- No lint script is defined.
- `npm run build`: PASS — TypeScript and Vite produced `dist/`.
- Fresh build: main JavaScript 27,178 bytes raw / 9,980 bytes gzip; supporting JavaScript 711 bytes; CSS 15,925 bytes raw / 4,390 bytes gzip; font 32,220 bytes; mobile AVIF 33,560 bytes; total `dist/` 318,397 bytes.

## Live build identity and routes

Every publicly served file in the fresh `dist/` byte-matches production, including HTML, 404, service worker, all JavaScript/CSS, font, images, icons, robots, and sitemap. Representative SHA-256 values:

- `index.html`: `09d00f20c39785aeb6ddf02f41a5fb3785c1e5b78341cfd01f5be53e08ca8051`
- `build/main-B11hUcfd.js`: `139419bf0790cc77f865db9a7d854b6410be9306836189265669f291dfcb1483`
- `build/style-D1Uo2pRS.css`: `5c7c914a545ef278526d8b31263928d38e8bc164af2dee2ea954223fabb5483e`
- `sw.js`: `4ac8f70f54a98aff839415f663997002dbf40882f1df7a0e0ebeebfdb3dfe7a7`
- `404.html`: `05037e91bc6a9747232b47b7fc15c6f1addf5c47de8d8a81c2ec9f468155c2d3`

`/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. `/missing-page` returns the designed 404 with HTTP 404. Same-origin page and metadata links resolve. The social image is a real 1200 × 630 JPEG, the touch icon is 180 × 180, and the favicon is SVG.

## Live game run and recovery

A fresh browser opened the title screen, activated the one-click sample, moved the paddle by keyboard, paused and resumed with P, traversed all seven modifier drafts, entered lap eight, and reached **Run complete** through the deployed runtime. Each draft contained exactly three modifier choices, exercised with both number keys and buttons.

- Result: 4,600 points; build `LLB-7B4T5S-DGCWEBM-0R6BEIC`.
- **Copy build string** reported `Build string copied.`
- **Start another run** reset lap/time/score to 1/60/0.
- The final live lap contained 10 armored guard bricks plus one 12-hit-point boss core.
- A completed real run saved 4,900 points and build `LLB-QNBLZ1-MEWGBHC-1R619YV`; the record survived reload.
- Repeating the same seeded demo choices twice produced the identical build `LLB-7B4T5S-CEBQHDW-0SBRZTA`.
- A one-hull boundary miss reached **Hull depleted**, hid Pause, and restart returned to lap 1. Persisted Assist mode started that next run with five hull.
- A paused real run restored the exact saved simulation tick. Assist, mute, J/L movement, and Escape pause settings survived reload.
- Malformed JSON, structurally incomplete JSON, and an out-of-range saved lap each recovered to a fresh 1/60 run with a visible canvas and no browser error.

The live script shortened only the wait between deterministic 60-second boundaries by pausing, changing the saved timer to its final fixed step, and reloading. The deployed game core performed every lap transition, draft, final-core transition, result, copy, and restart. The exact 8 × 60-second core is separately executed by the passing `finite-run` claim. Evidence: [win screen](verification-6-end-screen.png) and [loss screen](verification-6-loss-screen.png).

## Mobile, keyboard, and accessibility

- Desktop 1366 × 900 and mobile 390 × 844 scans of `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page` have zero serious or critical Axe WCAG 2 A/AA findings.
- At 390 px, there is no horizontal overflow and no measured visible interactive target under 44 × 44 CSS px.
- ArrowRight moved the live paddle from 0.500 to 0.614. A real CDP-held touch control moved it from 0.500 to 0.324. A touch drag across the canvas moved it to 0.750.
- Tab first reaches the skip link. Its visible focus is a 3 px gold outline; Enter targets `#main`. The next primary action has the same visible focus treatment.
- Opening settings by keyboard moves focus to Assist mode. Escape closes the native dialog and returns focus to **Game settings**.
- Reduced-motion media emulation matches and reduces UI transitions to 0.01 ms.
- `/opt/fleet/lib/verify-url.sh` passes in 636 ms: title, `lang=en`, one h1, main landmark, alt coverage, button names, screenshots, and zero load errors.

## Privacy, security, caching, PWA, and performance

- The complete live win/loss/recovery flow made 56 requests, all to `https://last-lap-breakout.sociobot.in`; no request failed and there were no console or page errors on valid routes.
- Demo completion left local storage empty. Leaving via **Start for real** removed all `demo:` session keys. Real settings and progress use only the documented local keys.
- Root headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and camera/microphone/geolocation/payment denial.
- HTML and `sw.js` use `public, must-revalidate, max-age=30`. Hashed JavaScript and CSS use `public, max-age=31536000, immutable`.
- The service worker is activated and controlling, has no waiting/installing update, and uses only cache `last-lap-breakout-v4`. After an online reload, `/demo` reloads offline with its title, demo banner, and canvas.
- Three live 390 px samples with 4× CPU throttling each recorded 300 frames. Every median and p90 was 16.7 ms; mean cadence was 16.666–16.888 ms, approximately 59.2–60.0 fps.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.057 s, LCP 1.282 s, TBT 62.5 ms, CLS 0.00016, transfer 83,022 bytes.

This is a static, account-free game. It has no server-side endpoint, product-unlock call, payment, sign-in, AI runtime, library package, or CLI. API allowance/429, Entra authority, backend concurrency/persistence, and consumer-package checks are not applicable.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
