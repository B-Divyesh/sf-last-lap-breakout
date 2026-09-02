# Adversarial first-read review 1 — FAIL

Reviewed commit `1cc130a42923137f8b0635a22bf77afedff3a4fb` on 2026-09-02 against `https://last-lap-breakout.sociobot.in` and a fresh local clone.

## Verdict

**FAIL.** Three blocking findings and six lower-severity findings remain. The first screen and demo pass, all 18 declared commands exit successfully, and the game reaches a real result. However, one first-screen sentence overstates the loop, two claim tests do not prove their claims, two README sentences break the 22-word limit, terminology is inconsistent, and route social metadata is incomplete.

## Findings

### F-1-1 — BLOCKING — the copy test does not prove that copying occurred

- Exact claim/location: `.factory/claims.json`, `copy-build`: “A completed run's build string can be copied.” The result screen exposes **Copy build string**.
- Observed: the live clipboard did receive the displayed code, but `npx playwright test --grep @claim:copy-build` only checks the success message `Build string copied.` It never reads the clipboard or compares it with the displayed build string.
- Why this matters: a broken clipboard write could still pass. The claim is therefore untested under the claims contract.
- Concrete fix: after clicking, read `navigator.clipboard.readText()` in the granted-permission context and assert that it exactly equals the visible build value. Retain the failure-path check for denied clipboard permission.

### F-1-2 — BLOCKING — decorative star motion continues with reduced motion enabled

- Exact claim/location: `.factory/claims.json`, `reduced-motion`: “Reduced-motion settings override screen movement.” The same behavior is described in `.factory/design.md` and Game settings.
- Observed: in a live reduced-motion context, the first star's canvas x-coordinate moved from `0` to `1.867`, with 55 distinct positions recorded. `draw()` advances stars from `state.elapsed` without checking the media preference. The passing test checks only `matchMedia()` and one button's CSS transition duration; it never inspects star drift or screen shake.
- Why this matters: the source-of-truth motion policy says star drift stops, but the decorative motion continues. The declared test cannot detect the failure.
- Concrete fix: render a fixed star offset when reduced motion is active. Then cause a hit/miss and assert that star positions stay fixed and the playfield never receives `is-shaking` in a reduced-motion context.

### F-1-3 — BLOCKING — the page promises a modifier after every lap, but the product provides seven

- Exact quotes/locations: landing first screen, “choose a modifier each lap”; landing How it works, “Pick one of three changes after each lap”; README summary, “with a new build each lap.”
- Observed: the live run provides a three-choice modifier after laps 1–7. Lap 8 ends at the result. The correctly scoped `finite-run` claim also says “each of the first seven.”
- Why this matters: the first screen makes an inaccurate core-loop promise, and that broader wording is not represented by the declared claim.
- Concrete fix: use “choose a modifier after each of the first seven laps” in explanatory copy. Rewrite the README line as “Finish an eight-minute Breakout run by choosing seven modifiers.”

### F-1-4 — MEDIUM — social metadata is stale or absent away from the home route

- Exact location: live `/demo`, `/play`, `/privacy`, and `/terms` keep the home `og:title`, `og:description`, `twitter:title`, and Twitter description. `/missing-page` has no Open Graph or Twitter tags.
- Observed: browser titles, descriptions, and canonicals update correctly. Social tags do not update in `src/main.ts`; `404.html` does not define them.
- Why this matters: shared deep links describe the landing page rather than the route, and the designed 404 has no social metadata.
- Concrete fix: provide route-specific static metadata for direct requests, or generate route HTML at build time. Add the full Open Graph and Twitter set to `404.html`.

### F-1-5 — MINOR — a README sentence is 37 words and uses compressed test jargon

- Exact quote/location: README, Test and build: “The test suite covers deterministic simulation, the full eight-lap result path, best-result reload persistence, keyboard, touch, playfield drag and P pause input, remapped keys, demo isolation, restored run progress, privacy, frame cadence, mobile layout, routes, and accessibility.”
- Why this matters: it exceeds the 22-word limit and makes “best-result reload persistence,” “demo isolation,” and “frame cadence” carry too much meaning in one sentence.
- Concrete fix: “Tests cover the game loop, controls, demo separation, saved runs, privacy, routes, layout, performance, and accessibility.”

### F-1-6 — MINOR — a README performance sentence is 23 words

- Exact quote/location: README, Data and privacy: “At 390px with 4× CPU throttling, the frame test requires a 14–18 ms median and a 90th-percentile interval no slower than 34 ms.”
- Why this matters: it exceeds the 22-word hard cap.
- Concrete fix: “The frame test uses a 390 px viewport with 4× CPU throttling. It requires a 14–18 ms median and a 90th percentile no slower than 34 ms.”

### F-1-7 — MINOR — “seeded” is unexplained jargon on the primary action

- Exact quote/location: landing first screen, “A seeded run starts immediately.”
- Why this matters: a first-time player does not need to understand random-number seeding to know what the action does.
- Concrete fix: “A sample run starts immediately.”

### F-1-8 — MINOR — the result identifier has three names

- Exact quotes/locations: landing first screen, “shareable build”; How it works, “final build” and “build string”; README, “new build” and “deterministic build string.”
- Why this matters: “build” can mean the selected modifiers or the result identifier. Switching terms makes the promised result less concrete.
- Concrete fix: call the identifier **build code** everywhere. For example: “finish with a score and build code” and “Your choices form the final build code.”

### F-1-9 — MINOR — “modifier draft” is unexplained game-design jargon

- Exact quote/location: README introduction, “A three-choice modifier draft follows each of the first seven laps.”
- Why this matters: “draft” is less direct than the action the player takes.
- Concrete fix: “After each of the first seven laps, choose one of three modifiers.”

## Cold first screen

### Mobile, 390 × 844

- What it does: an eight-minute Breakout run with eight laps and modifier choices.
- For whom: people taking a short break.
- First click: **Try it with sample data**; the adjacent text says a sample starts immediately.
- Result: PASS. The board, headline, audience sentence, primary action, result note, and real-start link are visible before scrolling. The sample action ends at about y=730.

### Desktop, 1440 × 900

- What it does: the same finite Breakout run.
- For whom: people taking a short break.
- First click: **Try it with sample data**.
- Result: PASS. The product board and action are visible without scrolling.

The cold read is clear despite F-1-3's inaccurate “each lap” detail.

## Copy audit

Counts treat a hyphenated term, number, or URL as one word and do not count standalone symbols. Headings, labels, and actions are included so the audit also checks context and verb naming. Canvas counters and the decorative run numbers are excluded because they are state labels rather than sentences.

### Landing page

| # | Text | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Skip to main content | 4 | Pass |
| 2 | Last Lap Breakout | 3 | Pass |
| 3 | Demo | 1 | Pass |
| 4 | How it works | 3 | Pass |
| 5 | Privacy | 1 | Pass |
| 6 | One run · Eight laps | 4 | Pass |
| 7 | Finish a Breakout run in eight minutes | 7 | Pass |
| 8 | For short breaks: clear eight fixed laps, choose a modifier each lap, and finish with a shareable build. | 18 | F-1-3, F-1-8 |
| 9 | Try it with sample data | 5 | Pass |
| 10 | A seeded run starts immediately. | 5 | F-1-7 |
| 11 | Start a new run | 4 | Pass |
| 12 | 8 × 60 seconds | 3 | Pass |
| 13 | Then the run ends. | 4 | Pass |
| 14 | Free. | 1 | Pass |
| 15 | No account. | 2 | Pass |
| 16 | No purchases or ads. | 4 | Pass |
| 17 | Keyboard and touch. | 3 | Pass |
| 18 | Assist mode included. | 3 | Pass |
| 19 | Sample board | 2 | Pass |
| 20 | How it works | 3 | Pass |
| 21 | Every run reaches a clear ending | 6 | Pass |
| 22 | Keep the orb alive | 4 | Pass |
| 23 | Move the paddle. | 3 | Pass |
| 24 | Break formations for 60 seconds. | 5 | Pass |
| 25 | A miss costs one hull point. | 6 | Pass |
| 26 | Choose one modifier | 3 | Pass |
| 27 | Pick one of three changes after each lap. | 8 | F-1-3 |
| 28 | Your choices shape the final build. | 6 | F-1-8 |
| 29 | Face the final core | 4 | Pass |
| 30 | Lap eight has a guarded core. | 6 | Pass |
| 31 | Survive it to get your score and build string. | 9 | F-1-8 |
| 32 | A finite game | 3 | Pass |
| 33 | What this game does not do | 6 | Pass |
| 34 | Your run and settings stay in this browser. | 8 | Pass |
| 35 | The game reloads offline after your first visit. | 8 | Pass |
| 36 | Start a new run | 4 | Pass |
| 37 | Eight fixed Breakout laps for a short break. | 8 | Pass |
| 38 | Privacy | 1 | Pass |
| 39 | Terms | 1 | Pass |
| 40 | Built by Param Factory (external site) | 6 | Pass |
| 41 | Original generated scene · v1.0.0 | 4 | Pass |

No landing sentence exceeds 22 words or contains a banned marketing word. All action labels are result-naming verbs. Section headings remain understandable out of context.

### README

| # | Text | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Last Lap Breakout | 3 | Pass |
| 2 | Finish an eight-minute Breakout run with a new build each lap. | 11 | F-1-3, F-1-8 |
| 3 | Last Lap Breakout is a free browser game for people taking a short break. | 14 | Pass |
| 4 | Every run has eight 60-second laps. | 6 | Pass |
| 5 | A three-choice modifier draft follows each of the first seven laps. | 11 | F-1-9 |
| 6 | The eighth lap is a guarded core battle, then the game gives you a score and deterministic build string. | 19 | F-1-8 |
| 7 | Play the isolated sample at `/demo` or `https://last-lap-breakout.sociobot.in/demo`. | 8 | Pass |
| 8 | It starts in one click and does not write to real-run storage. | 12 | Pass |
| 9 | Controls | 1 | Pass |
| 10 | Move with Left/Right or A/D. | 5 | Pass |
| 11 | Drag on the playfield or use the two touch controls on a phone. | 13 | Pass |
| 12 | Pause with P or the Pause run button. | 8 | Pass |
| 13 | Choose modifiers with keys 1–3 or their buttons. | 8 | Pass |
| 14 | Turn on assist mode for a wider paddle, slower orb, and one more hull point. | 15 | Pass |
| 15 | In Game settings, choose J/L or H/K as extra paddle keys and Escape as the pause key. | 17 | Pass |
| 16 | Run locally | 2 | Pass |
| 17 | Requires Node.js 20 or newer. | 5 | Pass |
| 18 | Open `http://localhost:4173`. | 2 | Pass |
| 19 | Use `http://localhost:4173/demo` for the clean sample run. | 7 | Pass |
| 20 | Test and build | 3 | Pass |
| 21 | The test suite covers deterministic simulation, the full eight-lap result path, best-result reload persistence, keyboard, touch, playfield drag and P pause input, remapped keys, demo isolation, restored run progress, privacy, frame cadence, mobile layout, routes, and accessibility. | 37 | F-1-5 |
| 22 | The production build lands in `dist/` with `index.html` and `404.html` at its root. | 13 | Pass |
| 23 | Data and privacy | 3 | Pass |
| 24 | The app has no account, purchases, analytics, ads, or third-party runtime requests. | 12 | Pass |
| 25 | A real run, its settings, and the highest completed result use local storage. | 13 | Pass |
| 26 | The demo uses separate `demo:` session storage keys for both progress and settings and never saves a best result. | 19 | Pass |
| 27 | The game reloads offline after the first visit. | 8 | Pass |
| 28 | At 390px with 4× CPU throttling, the frame test requires a 14–18 ms median and a 90th-percentile interval no slower than 34 ms. | 23 | F-1-6 |
| 29 | See `/privacy` and `.factory/demo.md` for details. | 6 | Pass |
| 30 | Deployment | 1 | Pass |
| 31 | Deploy the contents of `dist/` as a static site. | 9 | Pass |
| 32 | `staticwebapp.config.json` supplies the SPA fallback, security headers, and cache rules. | 10 | Pass |
| 33 | The service worker caches same-origin game files after the first production visit. | 12 | Pass |
| 34 | Project notes | 2 | Pass |
| 35 | Visual system | 2 | Pass |
| 36 | Tested claims | 2 | Pass |
| 37 | Handoff | 1 | Pass |
| 38 | The generated orbital scene is original to this product. | 9 | Pass; provenance is recorded in `assets/src/orbital-breakout.json` and `.factory/design.md` |
| 39 | Its prompt and review are stored in `assets/src/orbital-breakout.json`. | 8 | Pass |
| 40 | The Silkscreen font is licensed under the SIL Open Font License in `assets/src/OFL-Silkscreen.txt`. | 13 | Pass |
| 41 | Copyright © 2026 Param Factory. | 4 | Pass |
| 42 | Source code is released under the MIT License. | 8 | Pass |

Terminology currently used:

| Concept | Terms found | Required normalization |
| --- | --- | --- |
| Full session | run | None |
| Timed stage | lap | None |
| Ball | orb | None |
| Life counter | hull / hull point | None |
| Post-lap choice | modifier / change / modifier draft | Use “modifier” |
| Result identifier | build / shareable build / build string | Use “build code” |
| Isolated try-out | demo / sample run | Both are needed by the required action and banner; explain once as “sample demo” |

## Demo and sandbox

- PASS: the first-screen action opens `/demo` in one click.
- PASS: the first demo screen already shows an active lap with a moving orb, bricks, paddle, score, timer, hull, and touch controls.
- PASS: the banner says **Demo — sample data, nothing is saved** and keeps **Reset demo** and **Start for real** visible.
- PASS: a preloaded real settings value remained byte-for-byte unchanged after entering, changing demo settings, resetting, and leaving the demo.
- PASS: demo activity used only `demo:last-lap-breakout:*` session keys. Reset and Start for real removed them.
- PASS: a fresh live demo run reached seven three-choice modifier screens and **Run complete**, producing `LLB-7B4T5S-CEBQHDW-0SBRZTA`. The copied clipboard value matched, and local storage remained empty.
- PASS: every live request during the demo check was same-origin. No console or page errors occurred.

## Declared claims

Each exact command was run independently after `npm ci` in clean clone `/tmp/last-lap-review-1-clone.k7NXcg`.

| Claim ID | Command result | Proof assessment |
| --- | --- | --- |
| `finite-run` | PASS | Adequate |
| `demo-sandbox` | PASS | Adequate |
| `assist-mode` | PASS | Adequate |
| `modifier-effects` | PASS | Adequate |
| `key-remapping` | PASS | Adequate |
| `deterministic-build` | PASS | Adequate |
| `copy-build` | PASS | Incomplete; F-1-1 |
| `hull-loss` | PASS | Adequate |
| `input-parity` | PASS | Adequate |
| `canvas-drag` | PASS | Adequate |
| `default-pause` | PASS | Adequate |
| `local-recovery` | PASS | Adequate |
| `autosave-cadence` | PASS | Adequate |
| `best-result` | PASS | Adequate |
| `frame-rate` | PASS | Adequate |
| `local-privacy` | PASS | Adequate |
| `offline-reload` | PASS | Adequate |
| `reduced-motion` | PASS | Incomplete; F-1-2 |

F-1-3 is the only live/README product claim not represented accurately by the manifest. The other product-capability, privacy, offline, persistence, input, timing, and result statements map to declared claims.

## Structure, links, and accessibility

- PASS: `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. An unknown route returns the designed 404 with HTTP 404.
- PASS: each route has `lang="en"`, one `main`, one `h1`, a route title, a description, and a canonical URL.
- PASS: the root title is 44 characters and follows “Product — what it does.” Other route titles follow the required route pattern.
- PASS: favicon, 180 px touch icon, 1200 × 630 share image, robots, sitemap, CSP, referrer policy, and content-type protection are present.
- FAIL: route social metadata is not complete; see F-1-4.
- PASS: every same-origin page link crawled successfully. The current-page skip fragment on the 404 remains local to that 404. The external Param Factory link was not fetched because the work order forbids connecting to another product.
- PASS: deep links load directly. Link navigation, Back, and Forward update the page; focus moves to the new `h1`. A home-page scroll position of 1200 px restored after returning from Privacy.
- PASS: header and footer content is consistent across all routes and includes Privacy and Terms.
- PASS: the pixel cockpit, orbital art, hard rails, palette, type, and board-first mobile composition are recognizably product-specific and not a generic SaaS template.
- PASS: Playwright Axe scans found zero WCAG 2 A/AA violations on six routes at 390 × 844 and 1366 × 900. The factory URL verifier reported no load, landmark, alt, or button-label errors.
- PASS: mobile Lighthouse scored Performance 99, Accessibility 100, Best Practices 100, and SEO 100. Transfer was 81 KiB, LCP 1.4 s, TBT 100 ms, and CLS 0.

## History and regression check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The prior handoff and verification reports were read. Previously reported product defects were rechecked: demo isolation, mobile first-screen placement, the one-command test runner, best-result persistence, 44 px targets, saved-run validation, HTTP 404 handling, remapped controls and focus, settings pause, terminal Pause state, cache policy, frame cadence, local recovery, and one-second autosave all remain fixed. No prior product defect regressed.

## Missed leverage

No missing AI, import/export, or sync feature is implied by this brief. A deterministic, local, eight-minute arcade run does not benefit from sending play data to an AI service. The copyable build code already supplies the expected lightweight sharing path once F-1-1 proves it correctly.

## Repository gates

- `npm test`: PASS — 6 unit tests and 27 browser tests.
- `npm run build`: PASS — `dist/` produced; 318,397 bytes total; main JavaScript is 27,178 bytes raw and 9,980 bytes gzip.
- Live console/page errors: none on valid routes or the designed 404.
- Privacy/offline: same-origin request log and the dedicated offline claim pass.

## What would make this perfect

Resolve F-1-1 through F-1-9, then rerun every claim command from a clean clone, the full suite/build, the live route metadata crawl, and the two-viewport copy review. A perfect next round has accurate “first seven laps” wording, one plain term for the result code, no sentence over 22 words, route-correct social cards, and claim tests that observe both clipboard content and suppressed motion.
