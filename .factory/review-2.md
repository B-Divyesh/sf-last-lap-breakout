# Adversarial first-read review 2 — FAIL

Reviewed commit `0a89be2ce43963f372a87b37b021d510472a0d7a` on 2026-09-02 against `https://last-lap-breakout.sociobot.in` and a fresh local clone.

## Verdict

**FAIL.** The game is clear, playable, honest about its demo, and all declared claim tests pass. Three minor findings remain. Two visitor-facing factual promises have no declared claim, and the documented Rail palette token does not match the shipped token. This review can only pass when there are zero findings.

## Findings

### F-2-1 — MINOR — the price promise is not a declared claim

- Exact quote/location: landing fact, **“Free. No account.”** (`src/main.ts:63`); README introduction, **“Last Lap Breakout is a free browser game for people taking a short break.”** (`README.md:5`).
- Observed: `.factory/claims.json` contains `local-privacy`, which proves no account, purchase, ad, analytics, or personal-data request. It does not state or test that play is free.
- Why this matters: “Free” is a visitor-facing statement they may rely on. The claims contract requires it to have an observable sandbox test or to be removed.
- Concrete fix: add a `free-play` claim and a tagged browser test that enters the real and demo paths and confirms the complete game loop has no checkout, payment, paid gate, or charge request. Alternatively, remove “Free” from the landing, README, and Terms copy.

### F-2-2 — MINOR — the visitor-facing asset-provenance promise is unlisted and untestable

- Exact quote/location: footer, **“Original generated scene · v1.0.0”** (`src/main.ts:23`); README, **“The generated orbital scene is original to this product.”** (`README.md:52`).
- Observed: neither statement has an entry in `.factory/claims.json`. The repository contains a provenance record, but a browser sandbox cannot prove that an image is original or generated as asserted.
- Why this matters: the claims contract requires every statement a visitor can rely on to have a sandbox test. This provenance statement cannot meet that test in a browser flow.
- Concrete fix: retain the required provenance record in `.factory/design.md`, but remove the public “original generated” assertion from the footer and README. Do not add a decorative test that only checks the text exists.

### F-2-3 — MINOR — the recorded visual palette does not describe the shipped product

- Exact quote/location: `.factory/design.md:11` records Rail as **“`#293052`: borders and inactive track marks.”** The shipped `--rail` token is **`#4b5686`** in `src/style.css:12`.
- Observed: borders, the header rail, cards, controls, and inactive track marks all use `var(--rail)`, so the live product uses `#4b5686`, not the visual system’s recorded Rail color.
- Why this matters: the design document is the product’s source of truth for its visual identity. A later change cannot be checked or reproduced against a contradictory token list.
- Concrete fix: update `.factory/design.md` to state `#4b5686` and its contrast rationale, or change the CSS token to `#293052` after rechecking contrast.

## Cold first screen

### Mobile, 390 × 844

- What it does: a finite eight-minute Breakout run with seven modifier choices and a final build code.
- For whom: people on short breaks.
- First action: **Try it with sample data**; the adjacent copy says **“A sample run starts immediately.”**
- Result: PASS. The sample board, headline, audience sentence, primary action, helper text, and real-start link are visible before scrolling. The primary action ends at y=730.

### Desktop, 1440 × 900

- What it does: the same eight-lap Breakout run.
- For whom: people on short breaks.
- First action: **Try it with sample data**.
- Result: PASS. The board, job headline, audience sentence, and action are visible without scrolling.

## Copy audit

Counts treat a hyphenated term, number, version, and URL as one word. Navigation, headings, action labels, and footer labels are included. Dynamic HUD counters and decorative lap numbers are excluded because they are state values, not sentences.

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
| 8 | For short breaks: clear eight fixed laps, choose modifiers after the first seven, and finish with a build code. | 18 | Pass |
| 9 | Try it with sample data | 5 | Pass |
| 10 | A sample run starts immediately. | 5 | Pass |
| 11 | Start a new run | 4 | Pass |
| 12 | 8 × 60 seconds | 3 | Pass |
| 13 | Then the run ends. | 4 | Pass |
| 14 | Free. | 1 | F-2-1: unlisted claim |
| 15 | No account. | 2 | Pass; `local-privacy` |
| 16 | No purchases or ads. | 4 | Pass; `local-privacy` |
| 17 | Keyboard and touch. | 3 | Pass; `input-parity` |
| 18 | Assist mode included. | 3 | Pass; `assist-mode` |
| 19 | Sample board | 2 | Pass |
| 20 | How it works | 3 | Pass |
| 21 | Every run reaches a clear ending | 6 | Pass; `finite-run` |
| 22 | Keep the orb alive | 4 | Pass |
| 23 | Move the paddle. | 3 | Pass; `input-parity`, `canvas-drag` |
| 24 | Break formations for 60 seconds. | 5 | Pass; `finite-run` |
| 25 | A miss costs one hull point. | 6 | Pass; `hull-loss` |
| 26 | Choose one modifier | 3 | Pass |
| 27 | After each of the first seven laps, choose one of three modifiers. | 12 | Pass; `finite-run` |
| 28 | Your choices form the build code. | 6 | Pass; `deterministic-build` |
| 29 | Face the final core | 4 | Pass |
| 30 | Lap eight has a guarded core. | 6 | Pass; `finite-run` |
| 31 | Survive it to get your score and build code. | 9 | Pass; `finite-run` |
| 32 | A finite game | 3 | Pass |
| 33 | What this game does not do | 6 | Pass |
| 34 | Your run and settings stay in this browser. | 8 | Pass; `local-recovery`, `local-privacy` |
| 35 | The game reloads offline after your first visit. | 8 | Pass; `offline-reload` |
| 36 | Start a new run | 4 | Pass |
| 37 | Eight fixed Breakout laps for a short break. | 8 | Pass; `finite-run` |
| 38 | Privacy | 1 | Pass |
| 39 | Terms | 1 | Pass |
| 40 | Built by Param Factory (external site) | 6 | Pass |
| 41 | Original generated scene · v1.0.0 | 4 | F-2-2: unlisted, untestable provenance claim |

No landing text exceeds 22 words. The heading and action labels are plain and result-naming. Terminology is consistent: **run**, **lap**, **orb**, **hull**, **modifier**, and **build code**.

### README

| # | Text | Words | Result |
| ---: | --- | ---: | --- |
| 1 | Last Lap Breakout | 3 | Pass |
| 2 | Finish an eight-minute Breakout run by choosing seven modifiers. | 9 | Pass |
| 3 | Last Lap Breakout is a free browser game for people taking a short break. | 14 | F-2-1: unlisted claim |
| 4 | Every run has eight 60-second laps. | 6 | Pass; `finite-run` |
| 5 | After each of the first seven laps, choose one of three modifiers. | 12 | Pass; `finite-run` |
| 6 | The eighth lap is a guarded core battle. | 8 | Pass; `finite-run` |
| 7 | It ends with a score and build code. | 8 | Pass; `finite-run` |
| 8 | Play the isolated sample at `/?demo=1` or `https://last-lap-breakout.sociobot.in/?demo=1`. | 8 | Pass; `demo-sandbox` |
| 9 | It starts in one click and does not write to real-run storage. | 12 | Pass; `demo-sandbox` |
| 10 | Controls | 1 | Pass |
| 11 | Move with Left/Right or A/D. | 5 | Pass; `input-parity` |
| 12 | Drag on the playfield or use the two touch controls on a phone. | 13 | Pass; `canvas-drag`, `input-parity` |
| 13 | Pause with P or the Pause run button. | 8 | Pass; `default-pause` |
| 14 | Choose modifiers with keys 1–3 or their buttons. | 8 | Pass; `finite-run` |
| 15 | Turn on assist mode for a wider paddle, slower orb, and one more hull point. | 15 | Pass; `assist-mode` |
| 16 | In Game settings, choose J/L or H/K as extra paddle keys and Escape as the pause key. | 17 | Pass; `key-remapping` |
| 17 | Run locally | 2 | Pass |
| 18 | Requires Node.js 20 or newer. | 5 | Pass |
| 19 | Open `http://localhost:4173`. | 2 | Pass |
| 20 | Use `http://localhost:4173/?demo=1` for the clean sample run. | 7 | Pass; `demo-sandbox` |
| 21 | Test and build | 3 | Pass |
| 22 | Tests cover the game loop, controls, demo separation, saved runs, privacy, routes, layout, performance, and accessibility. | 13 | Pass |
| 23 | The production build lands in `dist/` with `index.html` and `404.html` at its root. | 13 | Pass |
| 24 | Data and privacy | 3 | Pass |
| 25 | The app has no account, purchases, analytics, ads, or third-party runtime requests. | 12 | Pass; `local-privacy` |
| 26 | A real run, its settings, and the highest completed result use local storage. | 13 | Pass; `local-recovery`, `best-result` |
| 27 | The demo uses separate `demo:` session storage keys for both progress and settings and never saves a best result. | 19 | Pass; `demo-sandbox` |
| 28 | The game reloads offline after the first visit. | 8 | Pass; `offline-reload` |
| 29 | The frame test uses a 390 px viewport with 4× CPU throttling. | 12 | Pass; `frame-rate` |
| 30 | It requires a 14–18 ms median and a 90th percentile no slower than 34 ms. | 15 | Pass; `frame-rate` |
| 31 | See `/privacy` and `.factory/demo.md` for details. | 6 | Pass |
| 32 | Deployment | 1 | Pass |
| 33 | Deploy the contents of `dist/` as a static site. | 9 | Pass |
| 34 | `staticwebapp.config.json` supplies the SPA fallback, security headers, and cache rules. | 10 | Pass |
| 35 | The service worker caches same-origin game files after the first production visit. | 12 | Pass; `offline-reload` |
| 36 | Project notes | 2 | Pass |
| 37 | Visual system | 2 | Pass |
| 38 | Tested claims | 2 | Pass |
| 39 | Handoff | 1 | Pass |
| 40 | The generated orbital scene is original to this product. | 9 | F-2-2: unlisted, untestable provenance claim |
| 41 | Its prompt and review are stored in `assets/src/orbital-breakout.json`. | 8 | Pass |
| 42 | The Silkscreen font is licensed under the SIL Open Font License in `assets/src/OFL-Silkscreen.txt`. | 13 | Pass |
| 43 | Copyright © 2026 Param Factory. | 4 | Pass |
| 44 | Source code is released under the MIT License. | 8 | Pass |

No README sentence exceeds 22 words. No banned marketing term, unexplained modifier jargon, or inconsistent result term was found.

## Demo and sandbox

- PASS: the first-screen **Try it with sample data** link opens `/?demo=1` in one click.
- PASS: the first demo screen is already active play with a moving orb, brick formation, paddle, timer, score, hull, pause control, settings, and phone controls.
- PASS: the persistent banner says **“Demo — sample data, nothing is saved”** and includes **Reset demo** and **Start for real**.
- PASS: in a fresh browser context, the demo initially had no local-storage keys and no session keys. The declared sandbox test then changed demo settings, waited for progress, reset, and started for real; it proved only `demo:` session keys changed or were removed and the preloaded real settings stayed unchanged.
- PASS: the demo request log contained only `https://last-lap-breakout.sociobot.in` requests and no console or page errors.

## Declared claims

Each command in `.factory/claims.json` was run separately from fresh clone `/tmp/last-lap-review-2.xI6nVA` after `npm ci`.

| Claim ID | Result |
| --- | --- |
| finite-run | PASS |
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

The repaired clipboard test reads the browser clipboard and checks the denied-permission fallback. The repaired reduced-motion test samples 30 animation frames, confirms fixed `0.000` star offset, and checks that shake never occurs. No declared claim test failed.

## Earlier-review and history check

Read `.factory/review-1.md`, `.factory/polish-1.md`, the prior handoff, and all verification records. Every earlier review finding was verified on the live site and in source:

| Earlier finding | Result |
| --- | --- |
| F-1-1 — clipboard proof | Fixed: the claim test reads and compares clipboard content. |
| F-1-2 — reduced-motion drift | Fixed: live and test star offsets remain `0.000`; no shake is recorded. |
| F-1-3 — modifiers after every lap | Fixed: landing and README correctly say the first seven laps. |
| F-1-4 — route social metadata | Fixed: direct route documents and live route metadata are route-specific; the 404 has OG/Twitter tags. |
| F-1-5 — long README test sentence | Fixed: 13 words. |
| F-1-6 — long README frame sentence | Fixed: two sentences of 12 and 15 words. |
| F-1-7 — “seeded” primary helper | Fixed: now reads “A sample run starts immediately.” |
| F-1-8 — result terminology | Fixed: visitor-facing copy uses “build code.” |
| F-1-9 — “modifier draft” jargon | Fixed: visitor-facing copy says “choose one of three modifiers.” |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, routing, accessibility, and visual identity

- PASS: `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. An unknown route returns the designed page with HTTP 404 and a way back.
- PASS: each HTML route has `lang="en"`, one `<main>`, one `<h1>`, a route-specific title, description, canonical, Open Graph title/description, Twitter title/description, favicon, and apple touch icon. `robots.txt` and `sitemap.xml` are present.
- PASS: same-origin navigation links resolve. The external Param Factory link was identified but not fetched because it is outside this work order’s product scope.
- PASS: direct route loads, Back navigation, h1 focus, metadata updates, and the mobile no-overflow check pass in the browser suite.
- PASS: header, footer, Privacy, and Terms are consistent across routes. The header includes a skip link.
- PASS: the pixel cockpit, hard rails, dark orbital scene, limited phosphor palette, and board-first phone layout are distinct from a generic SaaS template.
- PASS: the clean-clone Axe suite reports no serious or critical WCAG 2 A/AA findings on `/`, `/demo`, `/privacy`, and `/terms`. Valid live routes produced no console or page errors.
- F-2-3 remains: the palette documentation and shipped Rail token are inconsistent.

## Missed leverage

No missing AI, import/export, or sync feature is implied by the brief. This is a local, deterministic eight-minute arcade game; an AI request would not improve the core loop. The copyable build code provides the lightweight sharing outcome a player would reasonably expect.

## Repository gates

- `npm ci`: PASS — 61 packages installed; 0 vulnerabilities reported.
- All 18 exact claim commands: PASS.
- `npm test`: PASS — 8 Vitest tests and 28 Playwright tests.
- `npm run build`: PASS — `dist/` produced; 326,963 bytes total; main JavaScript 28.59 kB raw / 10.39 kB gzip.
- Live privacy request log: PASS — same-origin product resources only during demo use.

## What would make this perfect

Resolve F-2-1 by testing or removing the free-price promise. Resolve F-2-2 by removing the public provenance assertion that a browser sandbox cannot prove. Resolve F-2-3 by making the visual specification match the CSS token. Then rerun every claim command from a clean clone, the full suite and build, the live desktop/mobile cold read, and the live route metadata crawl. A PASS round has no remaining findings.
