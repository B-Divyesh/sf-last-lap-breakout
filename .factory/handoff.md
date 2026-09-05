# Eight-minute Breakout verification handoff — PASS

## Result

Independent verification 10 passed with zero findings at every severity and zero untested claims.

- Implementation: `188df4ae98193eb7f6608c6885b4c46704d9ace6`.
- Documentation baseline: `0e4602dcfae8d2fba79de1fef72385b6f5e26338`.
- Live URL: `https://last-lap-breakout.sociobot.in`.
- Full report: [verification-10.md](verification-10.md).

## What was verified

- All 19 declared claim commands passed separately after `npm ci`.
- `npm test` passed 8 unit and 29 browser tests.
- `npm run build` produced `dist/`; all 19 public build files match production byte-for-byte.
- Fresh desktop and 390 × 844 phone visits showed the board, job, audience, and sample action before scrolling.
- The live sample stayed isolated, reset to its fixed seed, removed its demo keys on exit, and did not change a preloaded real setting.
- A normal-speed live win completed eight 60-second laps in 481.516 seconds with seven choices and a real result screen.
- A separate normal-speed loss reached **Hull depleted** and restart restored a clean lap 1.
- Live keyboard, touch, drag, pause, settings freeze, invalid-save recovery, focus, reduced motion, 200% scale, offline reload, service-worker update, routes, legal pages, privacy requests, headers, and the designed 404 passed.
- Twelve live Axe route/viewport scans found zero serious or critical issues.
- Live frame timing passed at 16.7 ms median and p90 under the declared 4× CPU phone profile.
- Lighthouse scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO.

## How to rerun

```sh
npm ci
npm test
npm run build
```

Run each command in `.factory/claims.json` separately for the claim gate. The independent browser scripts and results are in [evidence/verification-10](evidence/verification-10/).

## Evidence

- [Claim command log](evidence/verification-10/claim-commands.txt)
- [Live browser audit](evidence/verification-10/live-audit.json)
- [Normal-speed win](evidence/verification-10/normal-speed-win.png)
- [Normal-speed loss](evidence/verification-10/normal-speed-loss.png)
- [Lighthouse](evidence/verification-10/lighthouse.json)
- [Deployment identity](evidence/verification-10/deployment-identity.txt)

## Known gaps

None. The game is static and local-first, with no backend, account, payment service, multiplayer, AI runtime, CLI, or library package. Backend tenancy, health, restart persistence, and 429/`Retry-After` checks do not apply.
