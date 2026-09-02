export interface FrameCadenceSummary {
  samples: number;
  median: number;
  p90: number;
}

export const FRAME_CADENCE_PROFILE = Object.freeze({
  warmupFrames: 180,
  sampleFrames: 900
});

export function measuredFrameIntervals(
  frameTimes: readonly number[],
  warmupFrames = FRAME_CADENCE_PROFILE.warmupFrames,
  sampleFrames = FRAME_CADENCE_PROFILE.sampleFrames
): number[] {
  const requiredTimestamps = warmupFrames + sampleFrames + 1;
  if (frameTimes.length !== requiredTimestamps) {
    throw new Error(`Expected ${requiredTimestamps} frame timestamps, received ${frameTimes.length}.`);
  }

  return frameTimes
    .slice(warmupFrames + 1)
    .map((time, index) => time - frameTimes[warmupFrames + index]);
}

export function summarizeFrameCadence(intervals: readonly number[]): FrameCadenceSummary {
  if (intervals.length === 0) throw new Error('At least one frame interval is required.');
  const sorted = [...intervals].sort((a, b) => a - b);
  const percentile = (fraction: number): number => sorted[Math.ceil(sorted.length * fraction) - 1];

  return {
    samples: intervals.length,
    median: percentile(0.5),
    p90: percentile(0.9)
  };
}
