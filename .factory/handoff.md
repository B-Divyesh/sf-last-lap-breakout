# Last Lap Breakout polish 1 handoff

## Delivered

Polish round 1 repairs every finding in `review-1.md` on commits `84550899ea04ef2e4e649e3e030e8527a83c84cc` and `6fbe97b03fe90fcfb505d4ac0750e55664f17674`.

- The first screen now accurately says modifiers follow the first seven laps and consistently calls the result a **build code**.
- `?demo=1` is the one-click, isolated sample URL. It has the persistent banner, Reset demo, Start for real, and only uses `demo:last-lap-breakout:*` session keys. `/demo` remains a direct route to the same sandbox.
- The clipboard claim reads the actual browser clipboard and checks the denied-permission fallback.
- Reduced motion freezes decorative star drift and suppresses shake after a real collision.
- Direct `/demo`, `/play`, `/privacy`, and `/terms` requests ship their own route-correct Open Graph and Twitter metadata. The designed 404 now has the same metadata set.

## Verification

Final clean clone: `/tmp/last-lap-breakout-final.SkBH66/repo` at `6fbe97b`.

- `npm ci`: passed with no vulnerabilities.
- All 18 exact commands declared by `.factory/claims.json`: passed independently from the clean clone.
- `npm test`: passed — 6 deterministic unit tests and 27 Chromium browser tests.
- `npm run build`: passed. `dist/` is 326,439 bytes; main JS is 28.06 kB raw / 10.18 kB gzip.
- Live deployment: `https://last-lap-breakout.sociobot.in` (Static Web App deployment `83431440-73a7-4637-acb8-0d7c765e2574`) returned HTTPS 200.
- `/opt/fleet/lib/verify-url.sh` passed on the live root and `https://last-lap-breakout.sociobot.in/?demo=1`: title, language, main landmark, image alt attributes, button labels, and console checks passed.
- Live Playwright Axe checks found zero serious or critical WCAG 2 A/AA issues on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404 at 390 × 844.
- Cold live checks confirmed route titles/social tags, static deep-link metadata, `?demo=1` banner/reset/exit isolation, reduced-motion fixed star offset, and no page errors on valid routes.

Evidence screenshots:

- `.factory/evidence/polish-1/live-home-mobile.png`
- `.factory/evidence/polish-1/live-demo-mobile.png`
- `.factory/evidence/polish-1/screenshot-desktop.png`
- `.factory/evidence/polish-1/screenshot-mobile.png`

## Run locally

```sh
npm install
npm run dev
npm test
npm run build
```

Use `http://localhost:4173/?demo=1` for the isolated sample game.

## Known gaps

None.
