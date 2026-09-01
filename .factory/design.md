# Last Lap Breakout visual system

## Direction and purpose

Last Lap Breakout uses a pixel/demoscene cockpit. A dark orbital track, scanline texture, sharp pixel corners, and a limited phosphor palette make the eight-lap structure feel like a finite arcade cartridge rather than an endless web game. The game canvas is the hero and the controls sit beside it; at phone widths the compact live board deliberately precedes the landing copy so a cold first viewport shows play instead of a menu wall.

## Palette

- Void `#080a16`: page and playfield background.
- Deck `#11152a`: solid information plates.
- Rail `#293052`: borders and inactive track marks.
- Paper `#f4f1df`: primary text (14.7:1 on Void).
- Cool ink `#aeb8d8`: secondary text (8.4:1 on Void).
- Boost `#64f4c2`: primary action and player paddle; dark text `#07130f` (13.2:1).
- Spark `#ffd166`: reward and score.
- Rival `#ff5c77`: boss, danger, and destructive controls.

The direction is deliberately single-mode. A light theme would break the dark-cockpit silhouette and reduce the perceived depth of the playfield.

## Type and spacing

Display text uses the self-hosted OFL font Silkscreen, chosen for square counters and legible pixel forms. Body and controls use the system sans stack for speed and clear small-screen reading. The scale is 14 / 16 / 20 / 28 / 48 px. Layout follows an 8 px base with 4 px micro-gaps, 16 px control groups, 32 px section gaps, and 64 px landing sections. Every header, footer, and demo action keeps a 44 px touch target; the phone headline is compact enough to retain both the live board and sample-run action in the cold viewport.

## Shape and interaction grammar

Panels have clipped upper-right corners, two-pixel rails, and hard four-pixel shadows. Primary actions fill with Boost; secondary actions are dark plates. Focus uses a three-pixel Spark outline. Buttons depress two pixels on activation. Status is always expressed by text or shape as well as color.

## Motion policy

The signature motion is a slow horizontal star drift behind the live canvas. Interface transitions last 180 ms and move no more than eight pixels. Screen shake is off in reduced-motion mode and can always be disabled. With `prefers-reduced-motion: reduce`, star drift stops, transitions become immediate, and screen shake is disabled. Players can map extra J/L or H/K movement keys and Escape pause in Game settings; arrows and A/D remain available.

## Game feel and difficulty

The fixed-step simulation runs at 60 Hz. Each lap lasts 60 seconds. Early laps use broad formations and a forgiving ball speed. Later laps add armored bricks and speed pressure. Lap eight uses a moving shielded core that opens after its guard bricks break. Missing the orb costs one hull point; zero hull ends the run. Assist mode widens the paddle, slows the orb, and adds one hull point. Every reward draft offers three readable modifiers from a deterministic seeded pool.

## Asset plan and provenance

- The game board, bricks, particles, icons, favicon, and control diagrams are original Canvas/CSS/SVG geometry authored for this repository.
- `assets/src/orbital-breakout.png` is generated for this product on 2026-09-01 with the factory image model (`factory-image`) and used to derive responsive WebP/AVIF hero and social art.
- Prompt sheet: **Subject:** one glowing cyan orb breaking through a ring of coral and gold pixel bricks above a tiny paddle. **World:** impossible orbital arcade track in deep space. **Materials:** chunky 16-bit pixels, dithered light, CRT phosphor grain. **Light:** cyan rim light and warm impact sparks. **Composition:** wide asymmetric scene with action on the right and calm dark space on the left. **Palette:** Void, Deck, Boost, Spark, Rival. **Negative list:** no people, no hands, no text, no letters, no logos, no watermark, no recognizable characters, no photorealism, no smooth 3D gradients.

Generated imagery is disclosed in the site footer. It is atmospheric only; all required information remains HTML text.
