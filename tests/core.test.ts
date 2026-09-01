import { describe, expect, it } from 'vitest';
import { buildString, choosePerk, createRun, LAP_SECONDS, makeBricks, runHash, stepRun, TOTAL_LAPS } from '../src/game/core';

describe('deterministic run core', () => {
  it('starts with the fixed session shape', () => {
    const run = createRun(1234);
    expect(run.lap).toBe(1);
    expect(run.lapTime).toBe(LAP_SECONDS);
    expect(TOTAL_LAPS).toBe(8);
    expect(run.status).toBe('playing');
  });

  it('offers identical rewards for the same seed', () => {
    const first = createRun(999);
    const second = createRun(999);
    first.lapTime = 0.001; second.lapTime = 0.001;
    stepRun(first, 1 / 60, 0); stepRun(second, 1 / 60, 0);
    expect(first.draft).toEqual(second.draft);
  });

  it('plays a scripted run through all eight laps', () => {
    const run = createRun(4242, true);
    for (let lap = 1; lap <= TOTAL_LAPS; lap++) {
      run.lapTime = 0.001;
      stepRun(run, 1 / 60, 0);
      if (lap < TOTAL_LAPS) {
        expect(run.status).toBe('draft');
        choosePerk(run, run.draft[0]);
      }
    }
    expect(run.status).toBe('won');
    expect(run.lap).toBe(8);
    expect(buildString(run)).toMatch(/^LLB-[A-Z0-9]+-[A-Z]+-[A-Z0-9]{7}$/);
  });

  it('builds a guarded final core', () => {
    const bricks = makeBricks(8);
    expect(bricks.filter(brick => brick.boss)).toHaveLength(1);
    expect(bricks.find(brick => brick.boss)?.hp).toBe(12);
  });

  it('creates stable hashes and different build paths', () => {
    const first = createRun(7); const second = createRun(7);
    expect(runHash(first)).toBe(runHash(second));
    first.perks.push('wide');
    expect(runHash(first)).not.toBe(runHash(second));
  });
});
