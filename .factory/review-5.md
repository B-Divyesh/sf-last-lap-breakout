# Review 5 — finish an eight-minute Breakout run

Reviewed on 2026-09-06 from a clean checkout and in fresh live browser contexts at `https://last-lap-breakout.sociobot.in`.

## Verdict

**PASS.** Zero findings at every severity. Zero untested claims.

| Result | Count |
| --- | ---: |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Minor findings | 0 |
| Untested claims | 0 |

## Product and release

- Job: finish a fixed eight-minute Breakout run and choose one modifier after each of the first seven laps.
- Audience: people on a short break who want a complete action-game run without an endless grind.
- First action: **Try it with sample data**. The adjacent text says, **“A sample run starts immediately.”**
- Implementation candidate: `188df4ae98193eb7f6608c6885b4c46704d9ace6`.
- Documentation checkout reviewed: `3183883ecd091feecc2534065b8c4a7766d9a120`.
- All implementation files are unchanged after the implementation candidate. Later commits contain reports and evidence only.
- All 19 public live files byte-match the fresh production build. Main script SHA-256: `476ebd18f7982c96fde46eac10b58451c181e00a4825769740d9557fea9dea4c`.

## First screen

Fresh contexts opened at scroll position zero.

| Check | Desktop, 1440 × 900 | Phone, 390 × 844 |
| --- | --- | --- |
| Job headline | Finish a Breakout run in eight minutes | Same |
| Audience | For short breaks | Same |
| First action | Try it with sample data | Same |
| Game shown | Board ends at 883 px | Board ends at 418 px |
| Action shown | Action ends at 781 px | Action ends at 730 px |
| Horizontal overflow | None | None |

The game board, job, audience, and sample action are visible before scrolling. The phone shows the game itself, not a menu wall.

Evidence: `/work/.evidence/review-5-first-screen-desktop.png` and `/work/.evidence/review-5-first-screen-mobile.png`.

## Complete game loops

### Desktop win

A fresh desktop context opened the home page, used the sample action, and played the deterministic sample at normal production speed. It used no test flag, storage edit, clock edit, or accelerated simulation.

- Duration: 481.619 seconds.
- Seven modifier screens appeared, each with three choices. Key `1` selected each choice.
- Final state: **Run complete**, lap 8 of 8, time 00.
- Score: 8,937 points.
- Build code: `LLB-7B4T5S-CEBQHDW-042X6C3`.
- The final guarded core appeared on lap eight.
- The persistent **Demo — sample data, nothing is saved** label remained on the end screen.
- Six observed runtime requests were all on the product origin. Console and page errors: 0.

Evidence: `/work/.evidence/review-5-normal-speed-win-desktop.png` and `/work/.evidence/review-5-live-audit.json`.

### Phone loss and restart

A separate fresh 390 × 844 touch context opened the home page, used the sample action, entered active play, and reached the real **Hull depleted** screen after 15.65 seconds.

- Final state: lost on lap 1 with 210 points.
- The build code appeared and the demo label remained visible.
- The Pause control was hidden at the terminal state.
- **Start another run** restored active lap 1, time 60, score `000000`, four hull points, and the Pause control.
- Console and page errors: 0.

Evidence: `/work/.evidence/review-5-normal-speed-loss-phone.png` and `/work/.evidence/review-5-live-boundaries.json`.

## Sample and real-data separation

- The first-screen sample action entered `/?demo=1` in one click.
- Active play appeared immediately with the fixed sample seed `0x1a57d3a0`.
- The demo label stayed visible during play, after reset, and on both end screens.
- Demo progress and settings used only `demo:` session-storage keys.
- A preloaded real setting stayed byte-for-byte unchanged during sample play and reset.
- **Reset demo** removed sample settings and restored lap 1 with the fixed seed.
- **Start for real** removed both sample keys and preserved the real setting.
- No sample action read or changed real progress.

## Declared claims

The clean clone used Node.js 22.23.2, which satisfies the documented Node.js 20+ requirement. `npm ci` installed 61 packages with zero reported vulnerabilities.

The claims manifest has 19 unique IDs. The test suite has exactly 19 matching tags, with no missing, duplicate, or undeclared tag. Every exact command in `.factory/claims.json` ran separately and passed.

| Claim | Result |
| --- | --- |
| `finite-run` | PASS |
| `free-play` | PASS |
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

The landing page, game, settings, Privacy, Terms, README, and metadata were cross-checked against the manifest. No missing, false, incomplete, or untested public claim was found.

## Normal, invalid, boundary, and recovery paths

- Keyboard arrows, A/D, J/L, H/K, number keys, Enter, Escape, and P work in their stated contexts.
- Touch buttons and a direct playfield drag move the paddle.
- P pauses and resumes. The simulation tick does not move while paused.
- Opening Game settings freezes play. Escape closes the dialog and returns focus to **Game settings**.
- Assist mode changes paddle width, orb speed, and hull on the next run.
- Default sound and screen movement react to a brick hit. Mute and movement-off stop those reactions and persist after reload.
- Hiding the page pauses and saves the run.
- An incomplete saved run and malformed saved settings recover to safe, playable defaults without a browser error.
- Reload restores full run state and settings. Active progress saves once per second.
- A completed real run stores its best result. Clipboard success and denied-permission recovery both pass.
- Every modifier effect is tested against the shared game calculations.

Evidence: `/work/.evidence/review-5-settings.json`.

## Accessibility and responsive use

- Twelve live Axe WCAG 2 A/AA scans covered `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404 at desktop and phone sizes. Violations at every impact level: 0.
- Every route has `lang="en"`, one `<main>`, one `<h1>`, a route title, complete image alt handling, and no horizontal overflow at the tested viewport.
- No visible link, button, input, or select is smaller than 44 × 44 CSS px.
- The first Tab reaches **Skip to main content**.
- Canvas, controls, and settings fields use the visible 3 px gold focus ring.
- Dialog focus starts on Assist mode. Escape closes it and restores focus to the opener. No keyboard trap appeared.
- The 200% page-scale check retained the heading, board, Pause control, and Game settings control.
- With reduced motion, transitions are 0.01 ms, star offset stays `0.000`, and a real brick hit causes no shake.
- The factory URL check reports the correct title, English language, one h1, main landmark, alt coverage, named buttons, and no console errors.

Evidence: `/work/.evidence/review-5-axe-all.json`, `/work/.evidence/review-5-mobile-200-percent.png`, and `/work/.evidence/review-5-verify/verify.json`.

## Routes, links, privacy, offline use, and security

- `/`, `/?demo=1`, `/demo`, `/play`, `/privacy`, and `/terms` return 200 with correct route titles.
- Same-origin page, asset, icon, robots, and sitemap links return 200. HTTP redirects to HTTPS.
- The external Param Factory link was identified but not fetched because it is outside this product’s allowed scope.
- An unknown route returns the designed **This lap does not exist** page with HTTP 404 and a route home. The browser’s failed-resource line for the deliberate 404 is expected and is not a defect.
- Privacy and Terms match observed storage and network behavior.
- Sample use and the complete run request only product-origin files. There are no account, payment, advertising, analytics, iframe, or personal-data requests.
- The service worker updated to an active state with no waiting or installing worker. `/demo` then reloaded offline with its title, heading, and canvas.
- Security headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera, microphone, geolocation, and payment denial.
- Hashed build files use one-year immutable caching. HTML and `sw.js` use short revalidation.

## Build and performance

- `npm test`: PASS — 8 Vitest tests and 29 Playwright tests.
- `npm run build`: PASS — `dist/` produced at 326,907 bytes.
- Main JavaScript: 28,557 bytes raw and 10,372 bytes gzip.
- CSS: 15,925 bytes raw and 4,391 bytes gzip.
- Live phone frame profile: 390 × 844, DPR 2, touch/mobile emulation, 4× CPU throttle, 180 warm-up frames, and 900 active-play samples.
- Frame result: 16.70 ms median, 16.70 ms p90, 16.70 ms p95, 16.80 ms maximum, and 0 intervals over 34 ms.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse metrics: FCP 1.080 s, LCP 1.305 s, TBT 17 ms, CLS 0.00016, and 83,420 transferred bytes.

Evidence: `/work/.evidence/review-5-lighthouse.json`.

## Earlier finding disposition

Every earlier review and verification report was inspected, including minor and low items.

| Earlier finding | Current proof and disposition |
| --- | --- |
| Initial: sample settings changed real storage | Fixed. The live sample wrote only `demo:` session keys and preserved a preloaded real value. |
| Initial: the phone first screen did not show the game | Fixed. The board ends at 418 px in the 844 px viewport. |
| Initial: `npm test` preview lifecycle failed | Fixed. The clean one-command gate passed 8 unit and 29 browser tests. |
| Verification 2: sample action was below the phone viewport | Fixed. It ends at 730 px. |
| Verification 2: best result did not persist | Fixed. The exact claim stores and reloads the score and build code. |
| Verification 2: mobile targets were under 44 px | Fixed. Twelve current route scans found no undersized visible target. |
| Verification 2: frame claim was absent | Fixed. The declared command and live profile both pass. |
| Verification 2: incomplete saved data froze play | Fixed. The live invalid record recovers to playable lap 1. |
| Verification 2: unknown routes returned 200 | Fixed. The current unknown route returns a designed 404. |
| Verification 2: keys could not be remapped | Fixed. J/L, H/K, Escape, arrows, and A/D work. |
| Verification 3: Lighthouse performance was 84–85 | Fixed. Current live performance is 100. |
| Verification 3: remapping fields had weak focus | Fixed. They use the current 3 px gold ring. |
| Verification 3: claim coverage and proof were incomplete | Fixed. There are 19 one-to-one declared commands, and all pass. |
| Verification 3: hashed assets cached for 30 seconds | Fixed. The live main script is immutable for one year. |
| Verification 3: Game settings did not pause play | Fixed. The live tick stayed fixed for 1.6 seconds. |
| Verification 3: supplied candidate SHA was invalid | Closed. Both current SHAs resolve and their roles are recorded above. |
| Verification 3: terminal Pause remained enabled | Fixed. It is hidden on the live loss and restored by restart. |
| Verification 4: frame claim and full gate failed | Fixed. Standalone, aggregate, and live frame checks pass. |
| Verification 4: drag, default pause, and recovery claims were missing or narrow | Fixed. Their complete exact commands pass. |
| Verification 5: recovery test was unreliable | Fixed. The exact command, aggregate suite, live invalid state, and reload checks pass. |
| Verification 5: one-second autosave was unlisted | Fixed. `autosave-cadence` is declared and passes. |
| Verifications 7–8: frame p90 intermittently reached 50 ms | Fixed. The active-play follower keeps both current samples in play at 16.70 ms p90. |
| Verification 9: Rail palette documentation drift | Fixed. Design and implementation use `#5969a4`. |
| Review 1: clipboard proof was incomplete | Fixed. The command reads and compares clipboard content and checks denial recovery. |
| Review 1: reduced-motion stars moved | Fixed. Current stars remain at `0.000`; a real hit causes no shake. |
| Review 1: copy promised a choice after every lap | Fixed. Public copy says after the first seven laps. |
| Review 1: route social metadata was stale or missing | Fixed. Each route and the 404 have their own metadata. |
| Review 1: two README sentences were too long | Fixed. The copy audit has no sentence over 22 words. |
| Review 1: “seeded” and “modifier draft” were unexplained | Fixed. The action and modifier instructions use plain words. |
| Review 1: the result used three names | Fixed. Public copy uses **build code**. |
| Review 2: free play was an unlisted promise | Fixed. `free-play` completes both real and sample runs while checking payment gates. |
| Review 2: public asset provenance was unlisted and unprovable | Fixed. The public assertion is absent; internal provenance remains. |
| Review 2: the Rail token did not match the design record | Fixed. The current shared value is `#5969a4`. |

No earlier finding is open, partial, or regressed.

## Scope exclusions

This is a static, local-first, single-player browser game. It has no backend, tenant, server database, account, payment service, multiplayer, AI runtime, CLI, library, or desktop installer. Backend tenancy, server restart persistence, health, 429/`Retry-After`, multiplayer clients, and consumer-install checks do not apply. The brief does not imply a missing AI, import, export, or sync feature.

## Final result

**PASS.** Candidate `188df4ae98193eb7f6608c6885b4c46704d9ace6` meets the browser-game contract at the live URL with **0 findings** and **0 untested claims**.
