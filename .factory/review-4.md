# Review 4 — finish an eight-lap Breakout run

Reviewed on 2026-09-06 at `https://last-lap-breakout.sociobot.in`.

## Verdict

**PASS.** Findings: **0**. Untested claims: **0**.

## Product, audience, and first action

The job is to finish a bounded Breakout run with build choices in about eight minutes. It is for people taking a short break. Before scrolling, fresh desktop and 390 × 844 phone visits show the game board, the heading **“Finish a Breakout run in eight minutes,”** the audience sentence, and **“Try it with sample data.”** The adjacent text says that the sample starts immediately. The phone board occupied y=149–418, and the action was visible in the first viewport. There was no horizontal overflow.

## Candidate and deployment identity

- Implementation reviewed: `188df4ae98193eb7f6608c6885b4c46704d9ace6`.
- Documentation checkout: `a2aa4f3f49073df798f5ee8a342d622cacb47b22`.
- The commits between them add reports and evidence only; they do not change product code.
- A fresh production build from the checkout byte-matched all 19 publicly served build files. The deployment configuration file is intentionally not publicly served. The deployed main script and the build both SHA-256 to `476ebd18f7982c96fde46eac10b58451c181e00a4825769740d9557fea9dea4c`.

## Clean checkout and claims

A fresh local clone completed `npm ci` with 0 reported vulnerabilities. `npm test` passed 8 Vitest tests and 29 Playwright tests (`NPM_TEST_EXIT=0`). `npm run build` passed and produced `dist/`. The generated main JS is 28,557 bytes raw / 10,372 bytes gzip; CSS is 15,925 bytes raw / 4,391 bytes gzip.

Every command declared in `.factory/claims.json` was run separately after the clean install. All 19 exited 0:

| Claim IDs | Result |
| --- | --- |
| `finite-run`, `free-play`, `demo-sandbox`, `assist-mode`, `modifier-effects` | PASS |
| `key-remapping`, `deterministic-build`, `copy-build`, `hull-loss`, `input-parity` | PASS |
| `canvas-drag`, `default-pause`, `local-recovery`, `autosave-cadence`, `best-result` | PASS |
| `frame-rate`, `local-privacy`, `offline-reload`, `reduced-motion` | PASS |

This includes the clipboard read and denied-permission fallback, complete real and sample paths without payment, demo namespace isolation, the exact modifier calculations, persistence and malformed-save recovery, and all advertised control paths. Current landing, game, privacy, terms, and README statements map to these claims; no unlisted visitor-facing claim was found.

## Live game runs

- Fresh phone sample run: held-pointer steering completed eight ordinary 60-second laps. Each of laps 1–7 displayed exactly three modifier choices. Selecting choice 1 each time reached the guarded eighth-lap result: **Run complete**, 8,916 points, four hull, and build code `LLB-7B4T5S-CEBQHDW-1L9V7NG`. No page or console error occurred, and all requests were to the product origin. Evidence: `/work/.evidence/review-4-live-win-phone.png`.
- Fresh phone real run without steering: reached **Hull depleted** on lap 1 with zero hull and 140 points. **Start another run** restored lap 1, 60 seconds, score 000000, four hull, and active play. Evidence: `/work/.evidence/review-4-live-loss-phone.png`.
- Fresh phone interaction check: ArrowRight moved paddle position 0.500 → 0.624; P paused and froze the tick; Game settings paused play; Escape returned focus to Game settings after closing the dialog. The dialog initially focused the labelled Assist mode control. Keyboard, touch buttons, canvas drag, default pause, remapped J/L and H/K, and copy behavior are also independently covered by their standalone claim commands.
- Invalid run, settings, and best-result storage values recovered to a clean, active lap 1 without errors.

## Demo, privacy, and offline behavior

The one-click `?demo=1` sample showed the persistent **“Demo — sample data, nothing is saved”** label. It started with default sample settings despite a preloaded real setting; changes wrote only `demo:` session keys. Reset removed demo keys, and Start for real removed all demo keys without changing the preloaded real value. The complete demo flow made only same-origin requests.

After an online first visit, a fresh service-worker-controlled context had active `/sw.js`, controller ownership, and cache `last-lap-breakout-v4`. `/demo` reloaded offline with HTTP 200, the correct title and heading, a canvas, and no errors. No update is promised beyond this offline support; the active worker had no waiting or installing replacement.

## Accessibility, routes, and legal pages

`verify-url.sh` passed the live root: HTTPS 200, title, `lang="en"`, one h1, main landmark, complete image alt coverage, named buttons, no console errors, and 774 ms measured load. Axe WCAG 2 A/AA scans found no violations at 1366 × 900 and 390 × 844 on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and an unknown route. All routes had one h1, one main, route-specific titles, no missing alt text, no overflow, and no visible target below 44 × 44 CSS px.

The first Tab stop is the skip link. Focus is visible and controls are operable without a trap. With `prefers-reduced-motion: reduce`, a real run recorded four hits while star offset stayed `0.000`, shake remained 0, and UI transition duration was 0.00001 seconds. At a 2× text-scale phone check, the board and sample action remained visible with no horizontal overflow.

All same-origin links returned 200. Privacy and Terms render correctly. The unknown route returned HTTP 404 with the designed **“This lap does not exist”** page, one main and h1, and a return link; the browser's expected resource error for the deliberately requested 404 is not a defect. Headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, nosniff, strict-origin referrer policy, and camera, microphone, geolocation, and payment denial.

## Performance

On a fresh 390 × 844 DPR 2 touch/mobile context with 4× CPU throttling, after 180 warm-up frames the 900 active-play samples measured 16.70 ms median, 16.80 ms p90, 33.30 ms p95, 50 ms maximum, and 2 intervals over 34 ms. This passes the declared 14–18 ms median and p90 no slower than 34 ms requirement. The run remained in playing state throughout measurement.

## Earlier finding disposition

All earlier review and verification reports, including minor items, were read. Current checks prove the following dispositions:

| Earlier finding | Current disposition |
| --- | --- |
| Demo leaked settings; mobile board/sample action were below the first viewport; test server lifecycle failed | Fixed. Fresh storage isolation, first-view measurements, and the exact clean `npm test` command pass. |
| Missing best result, recovery, input, autosave, and frame claims; incomplete recovery proof | Fixed. All corresponding declared commands pass independently and invalid live storage recovers. |
| Frame p90 failures in verifications 4–8 | Fixed. The standalone command, clean aggregate suite, and fresh live 900-frame sample all pass. |
| Rail token documentation drift | Fixed. The released build and design record use `#5969a4`. |
| Review 1 clipboard proof, reduced-motion drift, inaccurate “each lap” copy, metadata, sentence length, and terminology findings | Fixed. Clipboard command reads the clipboard and denial path; fresh live reduced-motion, copy, route, and audit checks pass. |
| Review 2 unlisted free-play/provenance claims and palette drift | Fixed. Free play has its own complete-flow claim; unprovable public provenance copy is absent; the palette record matches the shipped token. |

## Scope exclusions

This is a static, local-first single-player game. It has no backend, tenant, account, payment system, multiplayer, AI runtime, CLI, or library artifact. Tenant isolation, server restart persistence, health, rate-limit/429, and clean consumer-install checks do not apply.

## Final result

**PASS.** Candidate `188df4ae98193eb7f6608c6885b4c46704d9ace6` satisfies the browser-game contract at the live URL. Findings: **0**. Untested claims: **0**.
