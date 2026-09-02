# Last Lap Breakout independent verification 5 handoff

## Release decision: FAIL

Candidate `399acadd2a87d8c8c2740e084052cc505979f38d` was independently verified on 2026-09-02 from a clean checkout and against `https://last-lap-breakout.sociobot.in`. The previous READY report is superseded by this fresh result.

The live deployment byte-matches the candidate and the game works end to end, but release is blocked:

1. `npx playwright test --grep @claim:local-recovery` failed twice. It observed restored ticks 100 and 101 where the test required below 95. Consequently `npm test` fails with 25/26 Playwright tests passing.
2. The visible promise “Progress saves after each second” has no `.factory/claims.json` entry or dedicated tagged test. The existing recovery test saves by pressing P and does not prove autosave cadence.

Full evidence and repair guidance are in `.factory/verification-5.md`.

## Verification summary

- `npm ci`: PASS; 61 packages, 0 vulnerabilities.
- Exact claim commands: **16 PASS, 1 FAIL** (`local-recovery`).
- `npm test`: **FAIL**; 6/6 Vitest, 25/26 Playwright.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` produced.
- Cold first read: PASS on desktop and 390px; what/who/first action are plain, the sample is one click, and the game is visible immediately.
- Live identity: PASS; all 15 public build payloads byte-match the fresh candidate build.
- Live game: PASS through seven drafts, final core, Run complete, build copy/fallback, real best-result persistence, hull-depleted loss, and restart.
- Keyboard, real touch hold, canvas drag, remapping, dialog focus, visible focus, and mobile targets: PASS.
- Axe: zero serious/critical findings across six routes at desktop and mobile.
- Privacy: 46/46 requests in the winning flow were same-origin; demo local storage stayed empty; no console/page/request errors.
- PWA: active worker, no waiting update, correct cache, and offline `/demo` reload PASS.
- Frame claim: three live 4×-throttled samples had 16.7 ms median and p90.
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.305 s, TBT 142.5 ms, CLS 0.00016.

## Reproduce

```sh
npm ci
npx playwright test --grep @claim:local-recovery
npm test
npx tsc --noEmit
npm run build
```

Then run every command in `.factory/claims.json` independently. Add an autosave-cadence claim/test or remove the one-second promise before requesting another verification.

No product code or deployment infrastructure was changed.
