# Last Lap Breakout independent verification 9 — PASS

Candidate `6cb6d3a9f92590fecc8b7289f04e106721ba3206` was independently verified on 2026-09-02 against `https://last-lap-breakout.sociobot.in`.

## Verdict

**PASS.** All 18 required claim commands pass. The complete test, type-check, and production-build gates pass. All 19 public build artifacts byte-match production. A genuine live eight-minute run reaches **Run complete**, and a separate live run reaches **Hull depleted** and resets correctly.

## Verification summary

- `npm ci`: 61 packages installed, 0 vulnerabilities.
- All 18 `.factory/claims.json` commands: PASS.
- `npm test`: 8/8 Vitest and 28/28 Playwright tests passed.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` is 326,963 bytes.
- Cold first-read: PASS at desktop and 390 × 844. It states what the game is, who it is for, what to click, includes the one-click sample, and shows the board in the first viewport.
- Live full run: 481.395 seconds, seven three-choice drafts, final core, 14,369 points, build `LLB-7B4T5S-CEBQHDW-0MXK6F5`; clipboard and restart checks passed.
- Live loss: zero hull reached on lap 1 in 18.882 seconds; restart restored lap 1/time 60/score zero/four hull.
- Persistence, malformed-data recovery, assist mode, keyboard/remapping, real touch controls, canvas drag, pause, demo isolation, reduced motion, and offline reload passed.
- Axe: zero serious/critical findings across six live routes at desktop and mobile sizes. Keyboard focus is visible and dialog focus returns correctly.
- Live frame cadence at 390 px and 4× CPU: median 16.7 ms, p90 16.7 ms, p95 16.7 ms.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.218 s, TBT 129 ms, CLS 0.00016, transfer 83,431 bytes.
- Live traffic stayed same-origin with no console/page errors. Security headers, immutable hashed-asset caching, service-worker update state, and offline reload passed.

Full evidence and claim-by-claim results are in [verification-9.md](verification-9.md).

## Defects

- Critical: none.
- High: none.
- Medium: none.
- Low: `.factory/design.md` says Rail is `#293052`; the shipped CSS token is `#4b5686`. This documentation drift does not affect the passing contrast/accessibility result.

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

No deployment action was taken. This static product has no backend, billing, sign-in, or server-side endpoint.
