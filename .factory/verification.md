# Independent verification — FAIL

Verified candidate commit `454cee762a1832ae01c629a48ed5a21ca7de6579` at `https://last-lap-breakout.sociobot.in` on 2026-09-01. The deployed `index-Cixet_QB.js`, `index-DfkimesY.css`, and `share-card.jpg` SHA-256 values matched a fresh local production build of this commit. The live HTML was byte-equivalent to the build output.

## Release decision

**FAIL.** Three release-blocking checks did not meet the work-order contract.

### P1 — Demo settings write real-mode storage

Check: In a fresh production browser context, open `/demo`, open **Game settings**, select **Mute sound**, and choose **Save settings**.

Observed: Before the action, local storage was empty. Afterwards it contained `last-lap-breakout:settings:v1` with `{"assist":false,"muted":true,"shake":true}`. The demo page also reads this real settings namespace through `readSettings()`.

Expected: The demo banner promises that nothing is saved, and the demo-sandbox acceptance contract requires separate demo storage with no real-data read or write while the banner is present.

Impact: A sample run can change a visitor's real-mode settings. Give demo settings a `demo:` namespace (or keep all demo settings in memory/session storage) and prevent reads from real storage during demo mode.

### P1 — 390 px cold first viewport does not show the game

Check: Open `/` cold at 390 × 844 CSS px.

Observed: The first viewport plainly states the game, its audience, and the one-click sample action, but the live canvas begins at y=963.6 px and is not visible until scrolling. Evidence capture: `/tmp/last-lap-live-mobile-cold.png` during verification.

Expected: The browser-game acceptance contract requires the captured first screen to show the game itself rather than a menu wall.

Impact: The mobile first screen is a landing/menu view rather than a visible playable game. Bring the live canvas/preview into the first mobile viewport.

### P1 — `npm test` does not pass from the clean installed checkout

Check: After `npm ci`, run the repository's documented `npm test` command.

Observed: Vitest passed all 5 tests. Playwright passed its first 2 tests, then the configured managed preview at `127.0.0.1:4173` was unavailable. The remaining 7 browser tests failed with `page.goto: net::ERR_CONNECTION_REFUSED`.

Check for isolation: Start the exact production preview manually with `npm run preview`, then run `npx playwright test`.

Observed: All 9 browser tests passed in 25.7 seconds.

Expected: The documented one-command test quality gate must pass without a manually held server.

Impact: The required local quality gate is not reliable. Correct the Playwright web-server lifecycle/configuration and retain a passing `npm test` result.

## Required claims

After `npm ci`, every test declared in `.factory/claims.json` passed when run individually from the shipped demo/product entry points:

| Claim | Command | Result |
| --- | --- | --- |
| Eight fixed 60-second laps end with a result and build string | `npx playwright test --grep @claim:finite-run` | PASS (12.3 s) |
| Sample run is separate and does not save real progress | `npx playwright test --grep @claim:demo-sandbox` | PASS (9.8 s) |
| Keyboard and touch controls move the paddle | `npx playwright test --grep @claim:input-parity` | PASS (15.7 s) |
| Run progress and settings persist in this browser | `npx playwright test --grep @claim:local-recovery` | PASS (9.5 s) |
| No account, ads, analytics, or personal-data requests | `npx playwright test --grep @claim:local-privacy` | PASS (14.4 s) |
| Reloads offline after first visit | `npx playwright test --grep @claim:offline-reload` | PASS (4.3 s) |

The individual demo-sandbox claim is narrower than the work-order contract: it checks the real run-progress key, but it does not check the shared settings key identified above.

## Checks that passed

- Clean install: `npm ci` completed with 0 reported vulnerabilities. The first pre-install claim command correctly reported the missing local Playwright dependency; the commands above were then run after the required locked install.
- Production build: `npm run build` passed. Output: JS 23.64 KB raw / 9.01 KB gzip; CSS 14.75 KB raw / 4.18 KB gzip; `dist/` was produced.
- Full suite under a separately held production preview: 5 Vitest and 9 Playwright tests passed.
- Cold desktop first read: `Finish a Breakout run in eight minutes`; it says this is for short breaks, describes eight fixed laps/modifier choices, and presents **Try it with sample data** with the result of clicking stated beside it. Desktop has a visible live canvas and is not a menu wall.
- Game flow: From the title page, the sample action led to active play. The deterministic browser run reached **Run complete** with build string `LLB-7B4T5S-CEBQHDW-0SBRZTA`; **Start another run** reset the HUD to `1 / 8`. A separate normal-speed scripted local production-preview run reached **Hull depleted**, confirming the loss screen. Pause showed **Your lap is saved**. The scripted test shortens only wall-clock lap duration on localhost; the deployed JS was hash-matched to this candidate.
- Persistence: On live `/play`, a run key was saved after 1.15 seconds; Assist mode remained selected after reload.
- Inputs: On live `/play`, keyboard movement changed paddle position from 0.500 to 0.655; the on-screen left control returned it to 0.500. Keyboard pause and visible focus were checked.
- Mobile: At 390 × 844, all checked routes had no horizontal overflow; touch controls were 44 px or larger in the inspected layout. The first-viewport issue above remains.
- Accessibility: Live `/`, `/demo`, `/play`, `/privacy`, and `/terms` each had exactly one `<main>` and one `<h1>`. Axe WCAG 2 A/AA returned no serious or critical findings on each route. Reduced-motion context loaded without errors.
- Privacy/network: The live route flow made requests only to `https://last-lap-breakout.sociobot.in`; no browser console errors or page errors were recorded. This supports the no-account/no-analytics request check.
- Offline/service worker: The required fresh-context offline reload claim test passed. The worker registers, uses versioned cache `last-lap-breakout-v2`, calls `skipWaiting()` on install and `clients.claim()` on activation.
- Headers and caching: Live HTML and `sw.js` use `Cache-Control: public, must-revalidate, max-age=30`; hashed JS uses `public, max-age=31536000, immutable`. The live response includes CSP with self-only `connect-src`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and Permissions-Policy. No server-side API endpoints are present, so a request-allowance check is not applicable.
- Frame timing: 180 requestAnimationFrame intervals at 390 × 844 averaged 16.666 ms; p95 was 16.700 ms (about 60 fps) in headless Chromium.

## Test scope and evidence

- Commit: `454cee762a1832ae01c629a48ed5a21ca7de6579`
- URL: `https://last-lap-breakout.sociobot.in`
- Desktop cold capture: `/tmp/last-lap-live-cold-desktop.png`
- Mobile cold capture: `/tmp/last-lap-live-mobile-cold.png`
- Mobile active-play capture: `/tmp/last-lap-live-mobile.png`

No product code was changed during this verification.
