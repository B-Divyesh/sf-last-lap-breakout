# Last Lap Breakout verification handoff

## Release decision: FAIL

Independent verification 3 tested the live product at `https://last-lap-breakout.sociobot.in` on 2026-09-01. The supplied full candidate SHA `7ef7274fcb664fb0d7f6e34fa8d4aab0c56dd306` is not a Git object in the fetched history. Its unique prefix resolves to `7ef7274d57245506957fa9aa1e4d0c5ef493b543`; pre-verification `main` differed from that commit only in `.factory/handoff.md`, and the product tree was identical.

The deployment byte-matches a fresh local build of the resolved candidate, and the game works from title through win/loss and restart. It is not release-ready because mandatory gates still fail:

- Three fresh Lighthouse 12.8.2 mobile runs scored 85, 85, and 84 performance (required ≥90), with 580–620 ms TBT.
- Keyboard focus on the three key-mapping selects is a 1 px dark browser outline with less than 3:1 contrast. Other interactive controls have the designed gold ring.
- Visitor-facing assist, remapping, modifier, deterministic-build, and copy claims are absent from `.factory/claims.json`. The declared finite-run and frame-rate tests do not prove their full quantitative wording.
- Live hashed JS/CSS return `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching. `public/staticwebapp.config.json` has duplicate `routes` keys, and the discarded asset rule would not match the emitted filenames.
- Opening Game settings does not pause the active lap; the timer continued while the modal obscured play.

Full evidence and repair guidance are in `.factory/verification-3.md`.

## What passed

- All eight exact commands in `.factory/claims.json` passed after `npm ci`.
- `npm test`: 6/6 Vitest and 14/14 Playwright tests passed.
- `npx tsc --noEmit` passed; no lint script exists.
- `npm run build` passed and produced `dist/`.
- Cold first-read passes on desktop and 390 × 844: the game, audience, live board, sample-data action, and expected result are visible without scrolling.
- Independent live real-mode run reached **Run complete** at lap 8 with seven modifier choices, saved the best result, copied the build string, and restarted cleanly. A separate run reached **Hull depleted** and restarted cleanly.
- Keyboard, pointer bounds, persisted settings/progress, demo isolation, malformed-storage recovery, reduced motion, and offline reload passed.
- Live requests remained same-origin; normal flows had no console/page errors. Security headers are present.
- Axe found no serious/critical findings on all routes at desktop and mobile sizes; the manual focus-appearance issue remains.
- Raw initial JavaScript is 30,148 bytes, CSS is 15,852 bytes, the AVIF is 33,560 bytes, and the font is 32,220 bytes.
- Independent 4× CPU mobile/touch emulation measured 59.60 fps average and 16.8 ms p95 over 300 frames.

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

For the performance result, run Lighthouse 12.8.2 against the live root with mobile defaults and headless Chromium. For full commands, hashes, headers, and observed game results, see `.factory/verification-3.md`.

No product code was modified during verification.
