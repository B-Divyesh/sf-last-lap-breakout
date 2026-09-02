# Last Lap Breakout

Finish an eight-minute Breakout run by choosing seven modifiers.

Last Lap Breakout is a free browser game for people taking a short break. Every run has eight 60-second laps. After each of the first seven laps, choose one of three modifiers. The eighth lap is a guarded core battle. It ends with a score and build code.

Play the isolated sample at `/demo` or `https://last-lap-breakout.sociobot.in/demo`. It starts in one click and does not write to real-run storage.

## Controls

- Move with Left/Right or A/D.
- Drag on the playfield or use the two touch controls on a phone.
- Pause with P or the Pause run button.
- Choose modifiers with keys 1–3 or their buttons.
- Turn on assist mode for a wider paddle, slower orb, and one more hull point.
- In Game settings, choose J/L or H/K as extra paddle keys and Escape as the pause key.

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

Tests cover the game loop, controls, demo separation, saved runs, privacy, routes, layout, performance, and accessibility. The production build lands in `dist/` with `index.html` and `404.html` at its root.

## Data and privacy

The app has no account, purchases, analytics, ads, or third-party runtime requests. A real run, its settings, and the highest completed result use local storage. The demo uses separate `demo:` session storage keys for both progress and settings and never saves a best result. The game reloads offline after the first visit. The frame test uses a 390 px viewport with 4× CPU throttling. It requires a 14–18 ms median and a 90th percentile no slower than 34 ms. See `/privacy` and [.factory/demo.md](.factory/demo.md) for details.

## Deployment

Deploy the contents of `dist/` as a static site. `staticwebapp.config.json` supplies the SPA fallback, security headers, and cache rules. The service worker caches same-origin game files after the first production visit.

## Project notes

- [Visual system](.factory/design.md)
- [Tested claims](.factory/claims.json)
- [Handoff](.factory/handoff.md)

The generated orbital scene is original to this product. Its prompt and review are stored in `assets/src/orbital-breakout.json`. The Silkscreen font is licensed under the SIL Open Font License in `assets/src/OFL-Silkscreen.txt`.

Copyright © 2026 Param Factory. Source code is released under the [MIT License](LICENSE).
