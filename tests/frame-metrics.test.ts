import { describe, expect, it } from 'vitest';
import {
  FRAME_CADENCE_PROFILE,
  measuredFrameIntervals,
  summarizeFrameCadence
} from './frame-metrics';

function timestamps(intervals: readonly number[]): number[] {
  const times = [0];
  for (const interval of intervals) times.push(times[times.length - 1] + interval);
  return times;
}

describe('frame cadence measurement', () => {
  it('excludes startup frames before calculating the long-run p90', () => {
    const startup = Array.from({ length: FRAME_CADENCE_PROFILE.warmupFrames }, () => 50);
    const gameplay = Array.from({ length: FRAME_CADENCE_PROFILE.sampleFrames }, (_, index) => index % 20 === 0 ? 33.4 : 16.7);

    const intervals = measuredFrameIntervals(timestamps([...startup, ...gameplay]));
    const summary = summarizeFrameCadence(intervals);
    expect(intervals).toHaveLength(900);
    expect(summary.samples).toBe(900);
    expect(summary.median).toBeCloseTo(16.7, 8);
    expect(summary.p90).toBeCloseTo(16.7, 8);
  });

  it('still reports sustained slow gameplay after warm-up', () => {
    const startup = Array.from({ length: FRAME_CADENCE_PROFILE.warmupFrames }, () => 16.7);
    const gameplay = Array.from({ length: FRAME_CADENCE_PROFILE.sampleFrames }, (_, index) => index < 100 ? 50 : 16.7);

    expect(summarizeFrameCadence(measuredFrameIntervals(timestamps([...startup, ...gameplay]))).p90).toBe(50);
  });
});
