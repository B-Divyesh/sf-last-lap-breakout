# Independent verification 3 — FAIL

Verified on 2026-09-01 against `https://last-lap-breakout.sociobot.in` and the product tree identified by the unique prefix `7ef7274`.

The work order and prior handoff name candidate `7ef7274fcb664fb0d7f6e34fa8d4aab0c56dd306`, but that 40-character object does not exist in the fetched repository history. The unique prefix resolves to `7ef7274d57245506957fa9aa1e4d0c5ef493b543` (`fix: complete release QA repairs`). Pre-verification `main` at `83f09ff6abe4de8d2a455b05b40ede8822bcccba` differed from that resolved commit only in `.factory/handoff.md`; the product tree was identical.

## Decision

**FAIL.** The repaired game works end to end and every declared claim command passes, but the candidate still misses mandatory performance, keyboard-focus, caching, and claims-contract gates.

## Release-blocking findings

### High — mobile Lighthouse performance is below the required score

Three fresh Lighthouse 12.8.2 mobile runs against the live root scored **85, 85, and 84**, below the required 90. Results were stable:

| Run | Performance | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: |
| 1 | 85 | 1.2 s | 580 ms | 0 |
| 2 | 85 | 1.2 s | 610 ms | 0 |
| 3 | 84 | 1.3 s | 620 ms | 0 |

Accessibility, best practices, and SEO each scored 100. The third trace attributed 1.88 s of CPU time to `main-B8MBfMr3.js` and found five long tasks, including 317 ms and 316 ms tasks. This contradicts the handoff's reported performance score of 100 and fails the attached performance gate.

### High — keyboard focus is not visibly compliant on remapping controls

In the live Game settings dialog, keyboard Tab reaches all three remapping `<select>` controls, but they are omitted from the custom focus selector in `src/style.css`. Chromium computes their focus indicator as a 1 px `rgb(16, 16, 16)` auto outline. Its contrast is approximately 1.06:1 against the `#11152a` panel and 2.70:1 against the `#4b5686` control border, below the required 3:1. Buttons, links, canvas, and inputs correctly receive the designed 3 px gold outline.

This fails the non-negotiable visible-focus requirement for every interactive control. Axe does not detect this focus-appearance defect.

### High — the claims manifest does not cover all visitor-facing claims, and two declared tests do not prove their full wording

The landing page, settings, modifier cards, and README make testable claims absent from `.factory/claims.json`, including:

- Assist mode makes the paddle wider, slows the orb, and adds one hull point.
- J/L or H/K movement and Escape pause mappings work.
- Modifier cards make quantitative promises such as “Paddle grows 18%,” “Paddle moves 16% faster,” and “Hits score 40% more.”
- The build string is deterministic and can be copied.

There are untagged checks for remapping and deterministic core behavior, but the claims contract requires every visitor-facing claim to have a manifest entry and exactly one matching `@claim:` test.

Two declared tests are also narrower than their claims:

- `@claim:finite-run` uses the localhost-only accelerated clock and asserts the eighth-lap result, but never asserts that each lap is 60 seconds.
- `@claim:frame-rate` sets only a 390 × 844 desktop browser viewport. It does not enable mobile/touch emulation or CPU throttling, so it does not prove the words “on a mid-range phone.” An independent 4×-CPU, mobile/touch run did pass at 59.60 fps average with 16.8 ms p95, but the required declared sandbox test still omits that condition.

The claims policy says an unlisted claim fails review until it is removed or gets a matching claim test.

### Medium — hashed production assets are cached for only 30 seconds

Live `main-B8MBfMr3.js` and `style-B14Fh-o6.css` both return:

`Cache-Control: public, must-revalidate, max-age=30`

The required policy is long-lived immutable caching for content-hashed assets. `public/staticwebapp.config.json` contains two top-level `routes` members; the second overwrites the first. The discarded first rule also targets `/assets/index-*`, which does not match the emitted `main-*` and `style-*` filenames. The service worker still enables offline reload, but the HTTP cache policy fails the performance contract.

## Additional defects

### Medium — opening Game settings does not pause the active lap

On live `/play`, the timer changed from 58 to 57 while the modal Game settings dialog was open for 1.6 seconds. The canvas is obscured while the challenge continues. Players changing accessibility, audio, or key settings lose run time and can lose hull behind the dialog.

### Medium — the supplied full candidate commit is not a Git object

`git cat-file -e 7ef7274fcb664fb0d7f6e34fa8d4aab0c56dd306^{commit}` exits 128. The resolved commit is `7ef7274d57245506957fa9aa1e4d0c5ef493b543`. Product assets match that resolved commit, but the immutable candidate identifier in the work order and prior handoff is inaccurate.

### Low — end screens retain an enabled no-op Pause run button

After either **Run complete** or **Hull depleted**, the external **Pause run** button remains enabled. Activating it cannot change a won/lost state and produces no feedback.

## Mandatory first checks

`.factory/claims.json` exists. After the locked install, every exact listed command passed independently:

| Claim | Exact command | Result |
| --- | --- | --- |
| Finite eight-lap result | `npx playwright test --grep @claim:finite-run` | PASS, 1 test, 24.5 s |
| Demo namespace isolation | `npx playwright test --grep @claim:demo-sandbox` | PASS, 1 test, 16.9 s |
| Keyboard/touch parity | `npx playwright test --grep @claim:input-parity` | PASS, 1 test, 8.6 s |
| Local run/settings recovery | `npx playwright test --grep @claim:local-recovery` | PASS, 1 test, 10.0 s |
| Best-result persistence | `npx playwright test --grep @claim:best-result` | PASS, 1 test, 10.7 s |
| Frame cadence | `npx playwright test --grep @claim:frame-rate` | PASS, 1 test, 10.8 s |
| Same-origin requests | `npx playwright test --grep @claim:local-privacy` | PASS, 1 test, 8.5 s |
| Offline reload | `npx playwright test --grep @claim:offline-reload` | PASS, 1 test, 8.8 s |

The literal first pre-install invocation could not load `@playwright/test` because a clean clone has no `node_modules`. `npm ci` then installed 61 packages with zero reported vulnerabilities, after which all eight exact commands passed.

The cold first-read gate passes. At desktop and 390 × 844, the first screen says **Finish a Breakout run in eight minutes**, says it is for people on short breaks, shows the live game board, and presents **Try it with sample data** plus “A seeded run starts immediately.” At 390 px the preview ends at y=418.27 and the primary action ends at y=799.80, both within the 844 px viewport. There is no horizontal overflow.

## Build and automated gates

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- `npm test`: PASS; 6/6 Vitest tests and 14/14 Playwright tests.
- `npx tsc --noEmit`: PASS.
- No lint script exists.
- `npm run build`: PASS; `dist/` produced.
- Initial code budgets pass: 30,148 bytes raw JavaScript total and 15,852 bytes raw CSS. Main JavaScript is 9.88 KB gzip and CSS is 4.37 KB gzip. The initial AVIF is 33,560 bytes; the font is 32,220 bytes.
- Initial live transfer was approximately 80 KiB across six requests in Lighthouse.

## End-to-end game evidence

- The declared deterministic title-to-end Playwright run opened the sample from the landing action, traversed seven modifier drafts, reached lap 8, and displayed **Run complete** with `LLB-7B4T5S-CEBQHDW-0SBRZTA`.
- An independent live real-mode production run started from the title, entered lap 1 with 60 seconds/four hull, exercised all seven three-choice drafts with key 1, entered lap 8, and reached **Run complete**. The result was 5,641 points with build `LLB-QGJD9F-QCWBMHE-0M7VLSB`. The live-only run used the persisted-state boundary `lapTime=0.001` after pausing each lap; the deployed hostname ignored `?test=1`, so no localhost acceleration hook ran.
- **Copy build string** reported success. The result wrote `{score: 5641, build: "LLB-QGJD9F-QCWBMHE-0M7VLSB", completed: true}` to `last-lap-breakout:best:v1` and removed the finished run key.
- **Start another run** reset lap/time/score to `1 / 8`, `60`, and `000000`; enabled Assist mode produced five hull, and the saved best result remained unchanged through reload.
- A separate live boundary run with one hull and a missed orb reached **Hull depleted** on lap 1. Restart restored lap 1, 60 seconds, four hull, and zero score.
- ArrowRight moved the paddle from 0.500 to 0.634. Pointer dragging clamped it safely at 0.110 and 0.890. P paused, Enter resumed, malformed run/settings JSON recovered to a fresh run, and the live `?test=1` timer decreased normally rather than enabling test acceleration.
- Demo mode did not read preloaded real settings or best-result data, wrote only `demo:` session state, and **Start for real** discarded the demo session keys while preserving the real records.

## Live identity, privacy, accessibility, and PWA evidence

- Fresh local and live SHA-256 values match exactly: HTML `64aa6bdf…a4e9`, main JS `c8118a93…8b74`, CSS `c9270aab…a6b3f`, shared style JS `d2a32840…57d0`, service worker `a6a35e5f…0044`, and `404.html` `6372902b…c621`.
- The complete live winning flow made requests only to `https://last-lap-breakout.sociobot.in`; it had no failed requests, console errors, or page errors. No analytics, account, ad, AI, sign-in, or server-side API code was found.
- Because this is a static product with no server endpoints, request-allowance/429 and Entra-authority checks are not applicable.
- Root headers include a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions Policy.
- `/missing-page` returns HTTP 404 with the designed not-found document. All internal links and listed routes return their expected status. The external factory link was not requested because it is outside this work order's allowed product scope.
- The factory `verify-url.sh` passed with a 705 ms network-idle load, title, `lang=en`, one main/h1, no missing image alt text, no unlabeled buttons, and no root-page console error.
- Independent Axe WCAG 2 A/AA scans on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page` at 1440 × 900 and 390 × 844 found zero serious or critical findings. The manual focus defect above remains.
- Reduced motion was active when requested: the preview transform became `none` and transitions reduced to 0.01 ms.
- The service worker was active and controlling, had no waiting update, used cache `last-lap-breakout-v3`, and reloaded `/demo` offline with its heading, banner, and canvas.

## Required next repair

Reduce or suspend the continuously animated landing preview so repeated mobile Lighthouse runs score at least 90; add a designed ≥3:1 focus ring for `<select>`; expand `.factory/claims.json` and its tagged tests to cover all visible gameplay/settings claims and the full wording of quantitative claims; fix the single `routes` array and matching asset pattern so hashed assets receive immutable caching; pause gameplay while settings are open; and correct the candidate SHA in factory metadata. Then rerun this full matrix against the new candidate and deployment.

No product code was changed during this verification.
