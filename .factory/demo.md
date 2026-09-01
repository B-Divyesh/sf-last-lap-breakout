# Demo sandbox

- URL: `https://last-lap-breakout.sociobot.in/demo` (local: `http://localhost:4173/demo`).
- Sample: a deterministic run seeded with `0x1a57d3a0`, including the same eight laps and modifier draft as a real run.
- Reset: use **Reset demo** in the persistent banner. This clears and restarts only the demo run.
- Leave: use **Start for real**. Demo progress is discarded.
- Storage: demo progress uses session storage key `demo:last-lap-breakout:v1`. Real runs use local storage key `last-lap-breakout:v1`. Demo mode never reads or writes the real-run key.
- Verification: `?test=1` shortens wall-clock lap time only on localhost. It lets browser tests reach the genuine result UI without an eight-minute wait. The deployed hostname ignores this flag.
