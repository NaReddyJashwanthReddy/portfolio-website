export type JourneyMotion = { progress: number; phase: 'idle' | 'travel'; elapsed: number; quiet: number; direction: 1 | -1 };
export const journeyMotion = (progress = 0): JourneyMotion => ({ progress, phase: 'idle', elapsed: 0, quiet: .15, direction: 1 });

/** Follow the scrollbar immediately; the short quiet window animates the cloud only. */
export function advanceJourney(current: JourneyMotion, requested: number, dt: number, animated = true): JourneyMotion {
  const target = Math.max(0, Math.min(1, requested));
  const distance = target - current.progress;
  const quiet = !animated ? .15 : distance ? 0 : Math.min(.15, current.quiet + Math.max(0, dt));
  const active = animated && quiet < .15;
  return { progress: target, phase: active ? 'travel' : 'idle', quiet,
    elapsed: current.elapsed + (active ? Math.max(0, dt) : 0),
    direction: distance ? distance > 0 ? 1 : -1 : current.direction };
}
