# Verify the eight-minute Breakout game — PASS

Verified on 2026-09-05 from the supplied clean checkout and against `https://last-lap-breakout.sociobot.in`.

## Verdict

**PASS.** There are zero findings at every severity and zero untested claims.

| Result | Count |
| --- | ---: |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Minor findings | 0 |
| Untested claims | 0 |

## Product and release

- Job: finish a fixed eight-minute Breakout run, choosing one modifier after each of the first seven laps.
- Audience: people taking a short break who want a complete run without an endless grind.
- First action: **Try it with sample data**. The adjacent text says, **“A sample run starts immediately.”**
- Implementation reviewed: `188df4ae98193eb7f6608c6885b4c46704d9ace6`.
- Documentation baseline: `0e4602dcfae8d2fba79de1fef72385b6f5e26338`.
- The changes after the implementation commit are documentation and evidence only. All 19 publicly served files byte-match the fresh `dist/` build. The main script SHA-256 is `476ebd18f7982c96fde46eac10b58451c181e00a4825769740d9557fea9dea4c`.

## First screen

Fresh 1440 × 900 desktop and 390 × 844 phone contexts were opened at scroll position zero.

| Check | Desktop | Phone |
| --- | --- | --- |
| Job headline | Finish a Breakout run in eight minutes | Same |
| Audience | For short breaks | Same |
| First action | Try it with sample data | Same |
| Game shown | Board ends at 883 px | Board ends at 418 px |
| Action shown | Action ends at 781 px | Action ends at 730 px |
| Horizontal overflow | None | None |

The phone layout deliberately shows the board before the copy. It is the game, not a menu wall. Evidence: [desktop first screen](evidence/verification-10/first-screen-desktop.png) and [phone first screen](evidence/verification-10/first-screen-mobile.png).

## Declared claims

`npm ci` installed 61 packages with zero reported vulnerabilities. Each exact command in `.factory/claims.json` then ran separately. All 19 passed.

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

The manifest has 19 unique IDs. Each ID appears in exactly one matching `@claim:<id>` test, and there are no undeclared tags. The landing page, game, Privacy, Terms, README, and settings copy were cross-checked against the manifest. No missing, false, incomplete, or untested public claim was found. Evidence: [claim command log](evidence/verification-10/claim-commands.txt).

## Normal-speed game runs

A fresh live sample started from the landing action without `?test=1`, storage edits, timer edits, or other acceleration. A pointer followed the visible orb through eight ordinary 60-second laps. Key `1` chose one of three modifiers after each of the first seven laps.

- Duration: 481.516 seconds.
- End state: **Run complete**, lap 8 of 8, time 00.
- Result: 8,937 points.
- Build code: `LLB-7B4T5S-CEBQHDW-042X6C3`.
- The persistent demo label remained visible.
- All run requests stayed on the product origin. There were no console or page errors.

A separate unattended sample reached **Hull depleted** on lap 1 after 15.089 seconds. Pause was hidden at the terminal state. **Start another run** restored lap 1, time 60, score `000000`, four hull points, active play, and the Pause control.

Evidence: [winning end screen](evidence/verification-10/normal-speed-win.png), [loss end screen](evidence/verification-10/normal-speed-loss.png), [run timeline and results](evidence/verification-10/live-audit.json), and [loss/restart results](evidence/verification-10/live-boundaries.json).

## Demo and data isolation

- The landing action entered `/?demo=1` in one click.
- The first demo screen showed an active board, countdown, score, hull, controls, and fixed seed `0x1a57d3a0`.
- **Demo — sample data, nothing is saved** remained visible during play, reset, and the result.
- Changing demo settings and waiting for autosave created only `demo:` session keys.
- A preloaded real settings value remained byte-for-byte unchanged.
- **Reset demo** cleared demo settings and restored seed `0x1a57d3a0`, lap 1.
- **Start for real** removed both demo keys and preserved the real settings value.

Evidence: [active phone demo](evidence/verification-10/demo-mobile-active.png) and [live audit](evidence/verification-10/live-audit.json).

## Normal, invalid, boundary, and recovery paths

- Keyboard, touch buttons, and canvas dragging moved the paddle on production.
- P paused and resumed. The saved tick did not move while paused.
- Opening Game settings froze time and tick for 1.6 seconds. Escape closed it, returned focus, and play resumed.
- A structurally incomplete saved run recovered to a new playable lap 1 with no browser error.
- Reload recovery, one-second autosave, settings persistence, best-result persistence, clipboard success/fallback, Assist values, remapped keys, and every modifier calculation passed their exact claims.
- The live win, live loss, and restart reset were all observed at normal speed.

## Accessibility and responsive checks

- Twelve live Axe WCAG 2 A/AA scans covered `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404 at desktop and phone sizes. Serious or critical violations: 0.
- Every route had `lang="en"`, one `<main>`, one `<h1>`, a route title, image alt coverage, and no horizontal overflow.
- No visible link, button, input, or select measured below 44 × 44 CSS px.
- The first Tab reached **Skip to main content**. The playfield and settings fields used the designed 3 px solid gold focus ring.
- Settings opened by keyboard with focus on Assist mode. Escape closed it and restored focus to **Game settings**. No keyboard trap appeared.
- At 200% browser page scale, the heading, board, Pause, and Game settings controls remained present.
- With reduced motion, transitions were 0.01 ms, the star offset stayed `0.000`, and a real brick hit caused zero shakes.

## Routes, privacy, offline use, and security

- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with correct titles and metadata.
- An unknown route returned the designed page with HTTP 404 and a way home. Its one failed-resource console line is the expected result of that deliberate 404, not a defect.
- Same-origin navigation links resolved. The external factory link was identified but not fetched because it is outside this product's allowed resource scope.
- Privacy and Terms pages were readable and consistent with observed storage and requests.
- The demo flow and full eight-minute run requested only `https://last-lap-breakout.sociobot.in` resources. No account, payment, advertising, analytics, iframe, personal-data form, or third-party runtime request appeared.
- The service worker updated to `activated`, with no waiting or installing worker. `/demo` then reloaded offline with its title, heading, and canvas.
- HTTPS headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera, microphone, geolocation, and payment denial.
- Hashed JavaScript uses `public, max-age=31536000, immutable`. HTML and `sw.js` use short revalidation.

This is a static, local-first game. It has no backend, tenant, account, payment service, multiplayer, AI runtime, CLI, or library package. Tenant isolation, restart persistence on a server, health endpoints, and 429/`Retry-After` checks do not apply. No missing AI, import, export, or sync step is implied by the brief.

## Build and performance

- `npm test`: PASS — 8 Vitest tests and 29 Playwright tests.
- `npm run build`: PASS — `dist/` produced at 326,907 bytes.
- Main JavaScript: 28,557 bytes raw / 10,372 bytes gzip.
- CSS: 15,925 bytes raw / 4,391 bytes gzip.
- Live frame profile: 390 × 844, DPR 2, touch/mobile emulation, 4× CPU throttle, 180 warm-up frames, 900 active-play samples.
- Frame result: 16.7 ms median, 16.7 ms p90, 16.7 ms p95, 16.8 ms maximum, and 0 of 900 intervals over 34 ms.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.051 s, LCP 1.276 s, TBT 74 ms, CLS 0.00016, transfer 83,474 bytes.

Evidence: [full test log](evidence/verification-10/npm-test.txt), [build log](evidence/verification-10/npm-build.txt), [Lighthouse report](evidence/verification-10/lighthouse.json), [deployment identity](evidence/verification-10/deployment-identity.txt), [cache headers](evidence/verification-10/cache-headers.txt), and [factory URL check](evidence/verification-10/verify.json).

## Earlier finding disposition

Every earlier verification and review report was read. The current disposition is below.

| Earlier finding | Current proof and disposition |
| --- | --- |
| Initial: demo settings changed real storage | Fixed. The live demo wrote only `demo:` session keys and preserved a preloaded real value. |
| Initial: phone first screen did not show the game | Fixed. The board ends at 418 px in the 844 px phone viewport. |
| Initial: `npm test` preview lifecycle failed | Fixed. The one-command gate passed 8 unit and 29 browser tests. |
| Verification 2: sample action below phone viewport | Fixed. It ends at 730 px. |
| Verification 2: best result did not persist | Fixed. `best-result` passed and compares the stored score/build through reload. |
| Verification 2: mobile targets under 44 px | Fixed. No visible target was under 44 × 44 in 12 route scans. |
| Verification 2: frame claim absent | Fixed. `frame-rate` is declared and passed standalone, in the full suite, and live. |
| Verification 2: incomplete saved data froze play | Fixed. A malformed structured record recovered to lap 1 without an error. |
| Verification 2: unknown route returned 200 | Fixed. The designed unknown route returns 404. |
| Verification 2: keys could not be remapped | Fixed. `key-remapping` passed for J/L, H/K, Escape, arrows, and focus. |
| Verification 3: Lighthouse performance 84–85 | Fixed. The current live score is 100. |
| Verification 3: remapping selects had weak focus | Fixed. The exact remapping claim asserts the 3 px gold focus ring. |
| Verification 3: missing claims and narrow finite/frame tests | Fixed. There are 19 complete one-to-one claims; finite-run asserts 480 seconds and frame-rate uses the stated phone profile. |
| Verification 3: hashed files cached for 30 seconds | Fixed. The current main script is immutable for one year. |
| Verification 3: settings did not pause play | Fixed. The live tick remained 121 throughout the 1.6-second open dialog. |
| Verification 3: supplied candidate SHA was invalid | Closed for this release. Both supplied current SHAs resolve, and their roles are recorded above. |
| Verification 3: terminal Pause button remained enabled | Fixed. It was hidden on the live loss; restart restored it. |
| Verification 4: frame test and gate failed | Fixed. The standalone claim, full gate, and live 900-frame sample pass. |
| Verification 4: canvas drag/default P lacked claims; recovery proof was narrow | Fixed. `canvas-drag`, `default-pause`, and full-state `local-recovery` passed. |
| Verification 5: recovery test was unreliable | Fixed. The current exact test and full suite pass; live invalid-save and pause recovery also pass. |
| Verification 5: one-second autosave was unlisted | Fixed. `autosave-cadence` is declared and passed. |
| Verifications 7–8: frame p90 intermittently reached 50 ms | Fixed. The follower keeps the test in active play; both current runs pass at 16.7 ms p90. |
| Verification 9: Rail token documentation drift | Fixed. Design, CSS, canvas, and favicon all use `#5969a4`. |
| Review 1 F-1-1: clipboard test did not read the clipboard | Fixed. `copy-build` reads and compares it and checks denial fallback. |
| Review 1 F-1-2: reduced-motion stars still moved | Fixed. Live stars stayed at `0.000`; a real hit caused no shake. |
| Review 1 F-1-3: copy promised a modifier after every lap | Fixed. Public copy consistently says after the first seven laps. |
| Review 1 F-1-4: route social metadata was stale or absent | Fixed. Every route exposes its own title, description, canonical, Open Graph, and Twitter title. |
| Review 1 F-1-5: README sentence was 37 words | Fixed. The current copy audit has no sentence over 22 words. |
| Review 1 F-1-6: README performance sentence was 23 words | Fixed. It is split into sentences of 12 and 15 words. |
| Review 1 F-1-7: “seeded” was unexplained in the primary action | Fixed. The helper says, “A sample run starts immediately.” |
| Review 1 F-1-8: result identifier used three names | Fixed. Visitor copy uses **build code**. |
| Review 1 F-1-9: “modifier draft” was unexplained jargon | Fixed. Visitor copy says, “Choose one modifier.” |
| Review 2 F-2-1: free play was an unlisted promise | Fixed. `free-play` starts and finishes real and sample runs while watching for payment gates. |
| Review 2 F-2-2: public asset provenance was unlisted and unprovable | Fixed. The public provenance assertion is removed; internal records remain. |
| Review 2 F-2-3: Rail documentation did not match the product | Fixed. The shared value is `#5969a4`, with contrast recorded in the design document. |

## Final result

**PASS.** Candidate `188df4ae98193eb7f6608c6885b4c46704d9ace6` meets the researched browser-game contract at the live URL with zero findings and zero untested claims.
