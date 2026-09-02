# Last Lap Breakout independent verification 8 — FAIL

Candidate `416de04d3f3c7b840f1407849a69ce02629a6552` was verified on 2026-09-02 against `https://last-lap-breakout.sociobot.in`.

## Verdict

**FAIL.** `npx playwright test --grep @claim:frame-rate` failed at p90 **50 ms** versus the declared **≤34 ms** limit. The same assertion failed again in `npm test` at p90 **49.9 ms**. Any failing claim test is release-blocking.

## What passed

- The other 17 exact claim commands passed.
- `npm ci`, `npx tsc --noEmit`, and `npm run build` passed; 0 dependency vulnerabilities were reported. There is no lint script.
- The live deployment byte-matches all 19 public files in the candidate build.
- Cold first-read, one-click demo, desktop/390 px layouts, keyboard, real touch, canvas drag, focus, reduced motion, malformed-storage recovery, pause/reload persistence, demo isolation, privacy, service-worker update, offline reload, routes, headers, caching, and bundle budgets passed.
- Axe found zero serious/critical issues across six routes at both viewports. Valid routes had no console/page errors.
- A genuine live eight-minute run crossed all eight 60-second laps and reached **Run complete** with 12,815 points and copied build `LLB-7B4T5S-CEBQHDW-0JXLLOP`. A separate live run reached **Hull depleted** and restarted at lap 1 with a clean state.
- Fresh live frame sampling under the declared profile passed at median 16.7 ms and p90 16.7 ms. This does not override the two failures of the required local gate.
- Lighthouse mobile scored 96 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO; LCP was 1.277 s and CLS 0.00016.

## Evidence and reproduction

Full evidence, claim-by-claim results, hashes, headers, route checks, and defects are in [verification-8.md](verification-8.md). Screenshots and Lighthouse output are under [evidence/verification-8](evidence/verification-8/).

```sh
npm ci
npx playwright test --grep @claim:frame-rate
npm test
npx tsc --noEmit
npm run build
```

## Required next step

Stabilize the existing frame-cadence proof so the declared test passes reliably in a clean worker without weakening the advertised bound. Then rerun all 18 manifest commands and the complete test suite.
