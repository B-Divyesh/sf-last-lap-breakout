# Review 3 — verify an eight-minute Breakout run

Reviewed 2026-09-05 at `https://last-lap-breakout.sociobot.in` from the supplied clean checkout.

## Verdict

**PASS.** Zero findings at every severity. Zero untested claims.

| Result | Count |
| --- | ---: |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Minor findings | 0 |
| Untested claims | 0 |

## Product and release reviewed

- Job: finish a fixed eight-minute Breakout run by choosing one modifier after each of the first seven laps.
- Audience: people taking a short break who want a complete action-game run without an endless grind.
- First action: **Try it with sample data**. Its adjacent text says, “A sample run starts immediately.”
- Implementation candidate: `188df4ae98193eb7f6608c6885b4c46704d9ace6` (`fix: close claims and palette review findings`).
- Documentation baseline: `5df370728b0d4c1dce617eeb9c48c2784b544136` (`docs: record independent verification 10`).
- Production main script and the fresh build match: SHA-256 `476ebd18f7982c96fde46eac10b58451c181e00a4825769740d9557fea9dea4c`.

The later commits before this review are documentation/evidence commits. They do not change the implementation candidate.

## First screen

Fresh production browser contexts opened at scroll position zero.

| Check | Desktop, 1440 × 900 | Phone, 390 × 844 |
| --- | --- | --- |
| Title | Last Lap Breakout — finish eight arcade laps | Same |
| Job headline | Finish a Breakout run in eight minutes | Same |
| Audience text | For short breaks | Same |
| First action | Try it with sample data | Same |
| Board ends | 883 px | 418 px |
| Sample action ends | 781 px | 730 px |
| Horizontal overflow | None | None |

The board, job, audience, and sample action all appear before scrolling. The phone first screen shows the playable game board, not a menu wall. Screenshots: `/work/.evidence/review-3-desktop.png` and `/work/.evidence/review-3-phone.png`.

## Real game run and sample sandbox

A fresh phone context opened the live `/?demo=1` sample. It used one held pointer to follow the visible orb. This was an ordinary production run: no test query, storage edit, clock edit, or accelerated simulation was used. It selected one modifier at each of the first seven actual lap-complete screens.

- The run reached lap `8 / 8`, time `00`, and the actual **Run complete** screen.
- Result: 8,587 points.
- Build code: `LLB-7B4T5S-CEBQHDW-0JLN3XQ`.
- The persistent **Demo — sample data, nothing is saved** label remained visible on the result screen.
- There were no console or page errors, and all observed requests were same-origin.
- End-screen evidence: `/work/.evidence/review-3-live-win-phone.png`.

In a separate fresh production context, demo settings and progress used only `demo:` session-storage keys. A preloaded real settings value stayed unchanged. **Reset demo** cleared the sample keys, and **Start for real** discarded them without changing the real value.

Normal and recovery checks also passed in fresh live contexts:

- P paused at tick 35, remained at tick 35 for 350 ms, then resumed to tick 56.
- Opening Game settings froze the game at tick 59 for 350 ms. Escape restored play; the tick reached 81.
- A structurally incomplete saved run opened as playable lap 1. Remapped J moved the paddle from 0.500 to 0.386. No error occurred.
- The claimed deterministic loss/restart, copy fallback, local recovery, autosave, best result, modifier, input, and assist flows passed their standalone claim tests.

## Claims and repository gates

`npm ci` installed the documented clean checkout with 61 packages and zero reported vulnerabilities. The manifest contains 19 unique claim IDs, the test suite contains exactly 19 matching tags, and there are no missing, duplicate, or undeclared tags.

Every exact command declared in `.factory/claims.json` was run separately. All passed. The previously intermittent `frame-rate` command was rerun separately and passed in 26.1 seconds.

| Claim | Result |
| --- | --- |
| finite-run | PASS |
| free-play | PASS |
| demo-sandbox | PASS |
| assist-mode | PASS |
| modifier-effects | PASS |
| key-remapping | PASS |
| deterministic-build | PASS |
| copy-build | PASS |
| hull-loss | PASS |
| input-parity | PASS |
| canvas-drag | PASS |
| default-pause | PASS |
| local-recovery | PASS |
| autosave-cadence | PASS |
| best-result | PASS |
| frame-rate | PASS |
| local-privacy | PASS |
| offline-reload | PASS |
| reduced-motion | PASS |

`npm test` passed the 8 Vitest tests and 29 Playwright tests. `npm run build` passed and produced `dist/`. The generated initial main JavaScript is 28,557 bytes raw / 10,372 bytes gzip; CSS is 15,925 bytes raw / 4,391 bytes gzip.

The live frame measurement used a fresh 390 × 844 touch context, DPR 2, 4× CPU throttling, a held pointer following the visible orb, 180 warm-up frames, and 900 active-play samples. It measured a 16.7 ms median, 16.7 ms p90, 16.7 ms p95, and 16.8 ms maximum. This meets the published 14–18 ms median and no-slower-than-34 ms p90 claim.

No unlisted public claim was found in the landing page, game, legal pages, README, or settings. The product does not promise backend, multiplayer, account, payment, AI, import, export, or sync behavior.

## Accessibility, routes, privacy, and offline use

- Axe WCAG 2 A/AA scans of `/`, `/demo`, `/play`, `/privacy`, `/terms`, and an unknown route at desktop and phone sizes found zero violations in all 12 scans.
- Every checked route has `lang="en"`, one `<main>`, one `<h1>`, a route-specific title, and no horizontal overflow.
- Fresh keyboard checks found the skip link, visible focus, operable controls, focus return from settings, and no trap.
- A new service-worker-controlled context reloaded `/demo` offline with title **Demo — Last Lap Breakout**, heading **Play an eight-lap Breakout run**, and its canvas present.
- Same-origin production links returned 200. The unknown route returns the designed page with HTTP 404; that deliberate 404 is expected, not a defect.
- Privacy and Terms are readable and match observed local/session storage and same-origin requests. There are no account, payment, advertising, analytics, iframe, or personal-data controls.
- Live headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and camera, microphone, geolocation, and payment denial.

This static, local-first game has no backend, tenant, account, payment system, multiplayer, AI runtime, CLI, or library artifact. Tenant isolation, server restart persistence, health checks, and 429/`Retry-After` checks do not apply.

## Earlier findings

All earlier review and verification reports, including minor findings, were inspected. Their current disposition is verified below.

| Earlier finding group | Current disposition |
| --- | --- |
| Initial and verification 2: demo isolation, phone board/action, test lifecycle, best result, target size, recovery, 404, remapping | Fixed. Fresh production demo storage, first-screen dimensions, clean gates, malformed-save recovery, routes, and remapped-key checks pass. |
| Verification 3: performance, focus, claims coverage, asset caching, settings pause, candidate SHA, terminal Pause | Fixed. Frame measurements pass, focus uses the designed ring, 19 claims map one-to-one, the implementation SHA resolves, and live settings pause play. |
| Verifications 4–8: frame-rate or recovery reliability; missing input/autosave claims | Fixed. Every standalone claim command and the full gate pass. The live 900-frame phone profile also passes. |
| Verification 9: Rail token documentation drift | Fixed. The released main script matches the fresh build based on the documented `#5969a4` implementation. |
| Review 1: clipboard proof, reduced motion, first-seven wording, route metadata, copy wording and sentence length | Fixed. Claim tests, fresh route scans, and current visitor copy verify the repairs. |
| Review 2: unlisted free-play/provenance claims and Rail documentation | Fixed. Free play is claimed and tested; unprovable public provenance wording was removed; current documentation matches the released build. |

## Final result

**PASS.** Candidate `188df4ae98193eb7f6608c6885b4c46704d9ace6` meets the browser-game contract at the live URL. Findings: 0. Untested claims: 0.
