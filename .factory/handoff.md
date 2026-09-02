# Last Lap Breakout verification 7 handoff — FAIL

## Decision

**FAIL** for candidate `95e9d32892b5c4708773241bf46c2767bb5fca03` at `https://last-lap-breakout.sociobot.in` on 2026-09-02.

The exact `@claim:frame-rate` command failed in the mandatory claim sweep and failed again inside `npm test`: measured p90 was 50 ms, above the declared 34 ms maximum. A later isolated rerun passed at 33.4 ms, and three live runs passed at 16.7 ms p90, so the product is smooth live but its required clean-checkout claim gate is not reliable. Under the work order, either failing claim invocation is release-blocking.

## Verification summary

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- Exact `.factory/claims.json` commands: 17 PASS, 1 FAIL (`frame-rate`).
- `npm test`: FAIL; 6/6 unit tests and 26/27 browser tests passed.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` produced, 326,439 bytes total.
- Live deployment identity: PASS; every publicly served build artifact byte-matches the candidate.
- First-read and one-click sample gate: PASS on desktop and 390 × 844; the game board and sample action are above the fold.
- Scripted game run: PASS; title → active play → seven drafts → guarded final core → **Run complete** → copy → restart. A separate boundary run reached **Hull depleted** and restarted cleanly.
- Persistence and recovery: PASS for autosave/reload, settings, best result, demo isolation, malformed JSON, incomplete state, and out-of-range state.
- Inputs: PASS for arrows, remapped keys, pause, touch controls, and canvas drag.
- Accessibility: PASS; zero serious/critical Axe findings across six routes at desktop and mobile, visible 3 px focus, correct dialog focus return, no undersized visible targets, and reduced motion honored.
- Privacy/security: PASS; all 46 full-flow requests were same-origin, no failures/errors, and required security headers are present.
- PWA/offline: PASS; active service worker, `last-lap-breakout-v4`, clean update state, successful offline `/demo` reload.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.362 s, TBT 73.5 ms, CLS 0.00016.

## Required next step

Make `@claim:frame-rate` stable under its documented clean local 390 px, touch/mobile, 4× CPU scenario, or remove/change the quantitative claim. Then rerun every manifest claim separately and `npm test` from a clean install; both must pass without relying on a retry.

## Evidence

The full results and exact hashes are in [verification-7.md](verification-7.md). Captures and Lighthouse output are under [evidence/verification-7](evidence/verification-7).

No product code was changed during verification.
