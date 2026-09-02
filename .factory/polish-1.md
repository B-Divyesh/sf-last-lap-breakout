# Polish 1 — review finding closure

Base review: `review-1.md`, commit `9c22e651768193f5cbc5552a7d34e1acc6329579`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Renamed the result to build code. The `copy-build` claim now grants clipboard permission, compares `navigator.clipboard.readText()` to the visible code, and checks the denied-permission message in a separate context. | `@claim:copy-build` passed independently in final clean clone. |
| F-1-2 | `draw()` uses a zero star offset whenever `prefers-reduced-motion` matches. Shake remains disabled, and the runtime records no shake in that mode. | `@claim:reduced-motion` causes a real local brick hit, samples 30 frames at `0.000`, and asserts zero shakes; live `/play` reduced-motion check sampled only `0.000`. |
| F-1-3 | Landing, play guidance, README, metadata, brief, and design text now say modifiers are chosen after the first seven laps. | `@claim:finite-run` passed; cold mobile screenshot `.factory/evidence/polish-1/live-home-mobile.png`; live `https://last-lap-breakout.sociobot.in/`. |
| F-1-4 | Added static route documents for Demo, Play, Privacy, and Terms, configured their rewrites, updates SPA social tags on navigation, and added the full Open Graph/Twitter set to `404.html`. | Route/metadata browser test passed; live raw checks found route-specific OG and Twitter titles on `/demo`, `/play`, `/privacy`, and `/terms`; live 404 has its own tags. |
| F-1-5 | Rewrote the README test description as a plain 13-word sentence. | `.factory/copy-audit.md` and final clean-clone `npm test` passed. |
| F-1-6 | Split the README frame-budget sentence into two short sentences. | `.factory/copy-audit.md`; `@claim:frame-rate` passed independently in final clean clone. |
| F-1-7 | Changed the primary-action helper from “seeded” to “A sample run starts immediately.” | `.factory/evidence/polish-1/live-home-mobile.png`; live root cold check passed. |
| F-1-8 | Normalized all visitor-facing result terminology to **build code**. | `@claim:deterministic-build`, `@claim:copy-build`, and `@claim:best-result` passed independently; landing and result controls use build code. |
| F-1-9 | Replaced “modifier draft” with the direct instruction to choose one of three modifiers. | README and design copy updated; `@claim:finite-run` passed independently. |

Additional work-order closure: the first-screen action now opens the required isolated `?demo=1` sample URL. The final clean-clone `@claim:demo-sandbox` test passed, and the live check confirmed the banner, Reset demo, Start for real, and demo-only storage.

## Final evidence

- Commit deployed: `6fbe97b03fe90fcfb505d4ac0750e55664f17674`
- Live URL: `https://last-lap-breakout.sociobot.in/?demo=1`
- Screenshots: `.factory/evidence/polish-1/live-home-mobile.png`, `.factory/evidence/polish-1/live-demo-mobile.png`
- Full verification details: `.factory/handoff.md`
