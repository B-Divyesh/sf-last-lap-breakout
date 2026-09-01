# Last Lap Breakout

Finish an eight-minute Breakout run with a new build each lap.

Last Lap Breakout is a free browser game for people taking a short break. Every run has eight 60-second laps. A three-choice modifier draft follows each of the first seven laps. The eighth lap is a guarded core battle, then the game gives you a score and deterministic build string.

Play the isolated sample at `/demo` or `https://last-lap-breakout.sociobot.in/demo`. It starts in one click and does not write to real-run storage.

## Controls

- Move with Left/Right or A/D.
- Drag on the playfield or use the two touch controls on a phone.
- Pause with P or the Pause run button.
- Choose modifiers with keys 1–3 or their buttons.
- Turn on assist mode for a wider paddle, slower orb, and one more hull point.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:4173`. Use `http://localhost:4173/demo` for the clean sample run.

## Test and build

```sh
npm test
npm run build
```

The test suite covers deterministic simulation, the full eight-lap result path, keyboard and touch input, demo isolation, local recovery, privacy, mobile layout, routes, and accessibility. The production build lands in `dist/` with `index.html` at its root.

## Data and privacy

The app has no account, analytics, ads, or third-party runtime requests. A real run and its settings use local storage. The demo uses separate `demo:` session storage keys for both progress and settings. The game reloads offline after the first visit. See `/privacy` and [.factory/demo.md](.factory/demo.md) for details.

## Deployment

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` supplies the SPA fallback, security headers, and cache rules. The service worker caches same-origin game files after the first production visit.

## Project notes

- [Visual system](.factory/design.md)
- [Tested claims](.factory/claims.json)
- [Handoff](.factory/handoff.md)

The generated orbital scene is original to this product. Its prompt and review are stored in `assets/src/orbital-breakout.json`. The Silkscreen font is licensed under the SIL Open Font License in `assets/src/OFL-Silkscreen.txt`.

Copyright © 2026 Param Factory. Source code is released under the [MIT License](LICENSE).
