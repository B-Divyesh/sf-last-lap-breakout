# Repair 8 handoff — PASS

## Release

- Implementation commit: `188df4ae98193eb7f6608c6885b4c46704d9ace6` (`fix: close claims and palette review findings`).
- Documentation and evidence commit: `30f64ab4539ca2b96ba70a35cbceaa5be4ca9622` (`docs: record repair 8 verification`).
- Deployment: static production upload completed for `sf-last-lap-breakout`; `https://last-lap-breakout.sociobot.in` returned HTTPS 200 afterwards.
- Live identity: the deployed `main-8oI5op97.js` and `style-qWge9HFd.css` SHA-256 values match this commit's `dist/` exactly.
- Catalog description: `.factory/catalog-description.txt` is verb-first and 65 characters. Its required copy is at `/work/.evidence/catalog-description.txt`.

## What changed

1. Added the `free-play` claim. Its browser test starts both real and sample runs from the landing page, finishes each run, and observes no payment request, popup, payment control, or paid gate.
2. Removed the public **“Original generated scene”** assertion from the SPA and standalone 404 footer, plus the README assertion. The required internal asset provenance remains in `.factory/design.md` and the asset sidecar.
3. Unified the documented and shipped Rail token at `#5969a4`. Canvas rails and the favicon use the same color. The design record includes its 3.74:1 Void and 3.42:1 Deck contrast measurements.

## Verification

### Clean local setup

- `npm ci`: passed; 61 packages installed and 0 vulnerabilities reported.
- All 19 declared commands in `.factory/claims.json` were run separately after the clean install and passed: `finite-run`, `free-play`, `demo-sandbox`, `assist-mode`, `modifier-effects`, `key-remapping`, `deterministic-build`, `copy-build`, `hull-loss`, `input-parity`, `canvas-drag`, `default-pause`, `local-recovery`, `autosave-cadence`, `best-result`, `frame-rate`, `local-privacy`, `offline-reload`, and `reduced-motion`.
- `npm test`: passed — 8 Vitest tests and 29 Playwright tests.
- `npm run build`: passed. `dist/` is 326,907 bytes; main JavaScript is 28,557 bytes raw / 10,372 bytes gzip and CSS is 15,925 bytes raw / 4,391 bytes gzip.
- Claim-tag audit: 19 manifest IDs, with exactly one matching tagged test per ID.

### Deployed browser checks

- Factory URL verification passed on HTTPS root: title, `lang`, one `h1`, `main`, image alt coverage, labelled buttons, and no valid-route console or page errors. Measured network-idle load was 623 ms.
- Fresh desktop and 390 × 844 phone contexts both show the board, **“Finish a Breakout run in eight minutes,”** the short-break audience sentence, and **Try it with sample data** before scrolling. On phone the board ends at 418.3 px and primary action at 729.8 px; there is no horizontal overflow.
- The live demo was entered from the landing action. Its persistent **“Demo — sample data, nothing is saved”** label remained visible; Reset demo restored the fixed seed; Start for real removed demo session keys. A preloaded real settings value remained byte-for-byte unchanged.
- Live Axe WCAG 2 A/AA scans on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page` found zero serious or critical violations. `/missing-page` returns the designed page with the expected HTTP 404; Chromium's failed-resource console line for that deliberate 404 is recorded as expected, not a product error.
- Live Lighthouse 12.8.2: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1,054 ms, LCP 1,279 ms, TBT 13 ms, CLS 0.00016.
- Live headers retain self-only CSP including `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and denied payment/camera/microphone/geolocation permissions.

### Normal-speed game run

- A fresh live sample was started from the landing action without `?test=1` or stored-state edits.
- The first unsteered run reached the genuine **Hull depleted** end screen. With Assist mode selected through Game settings, **Start another run** reset to lap 1, 60 seconds, score `000000`, and five hull points.
- The restarted live run completed seven ordinary 60-second laps. It selected one modifier using the advertised `1` key after every draft, then completed the real guarded final-core lap.
- The actual result screen showed **Run complete**, 8,461 points, build code `LLB-7B4T5S-CEBQHDW-18LS1Y3`, the copy action, restart action, and the persistent demo label. There were no browser errors.
- Evidence: [first desktop screen](evidence/live-repair-8/first-screen-desktop.png), [first phone screen](evidence/live-repair-8/first-screen-mobile.png), [active phone demo](evidence/live-repair-8/demo-mobile-active.png), [loss screen](evidence/live-repair-8/live-loss.png), [win screen](evidence/live-repair-8/live-win.png), [live browser report](evidence/live-repair-8/browser-check.json), [live run report](evidence/live-repair-8/live-win-run.json), and [Lighthouse report](evidence/live-repair-8/lighthouse.json).

## Earlier finding disposition

| History | Current disposition |
| --- | --- |
| Initial verification findings: demo isolation, mobile first screen, one-command test lifecycle, best result, target size, saved-run validation, 404 status, key remapping, cache policy, settings pause, terminal Pause control | Fixed and retained by the passing demo, recovery, target/layout, route, remapping, pause, and full-suite checks. |
| Verification 3–8: performance, select focus, all visible claims, frame cadence reliability, canvas drag/default pause, recovery proof, autosave cadence | Fixed. The current suite includes the matching browser claims; the current 4× CPU mobile frame claim passed independently and in `npm test`. Lighthouse also passed. |
| Review 1 F-1-1 through F-1-9 | Fixed and retained: clipboard is read, reduced-motion stars/shake are measured, copy says first seven modifiers and build code, route social metadata is complete, README is plain and within the limit, and the prior jargon/terminology is removed. |
| Review 2 F-2-1 | Fixed by the `free-play` manifest claim and end-to-end real/sample no-payment proof. |
| Review 2 F-2-2 | Fixed by removing unprovable public original/generated assertions while retaining internal provenance records. |
| Review 2 F-2-3 | Fixed by one documented/shipped Rail token, now contrast-checked. |

## Known gaps and next steps

No known product defect remains. This is a static, local-first game with no backend, account, payment endpoint, AI integration, or multiplayer service; backend tenancy, restart persistence, 429/Retry-After, and external-provider checks do not apply. The first Lighthouse invocation crashed its browser tab before scoring; the immediate retry with safe installed-Chromium flags completed with the scores recorded above.
