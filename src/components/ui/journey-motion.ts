export type JourneyMotion = { progress: number; phase: 'idle' | 'summon' | 'travel' | 'settle'; elapsed: number; direction: 1 | -1 };
export const journeyMotion = (progress = 0): JourneyMotion => ({ progress, phase: 'idle', elapsed: 0, direction: 1 });

/** Scroll requests a destination; only cloud travel advances the displayed scene. */
export function advanceJourney(current: JourneyMotion, requested: number, dt: number, animated = true): JourneyMotion {
  const target = Math.max(0, Math.min(1, requested));
  const distance = target - current.progress;
  if (!animated) return { ...current, progress: target, phase: 'idle', elapsed: 0, direction: distance ? distance > 0 ? 1 : -1 : current.direction };
  const next = { ...current, elapsed: current.elapsed + Math.max(0, dt) };
  if (next.phase === 'idle' && Math.abs(distance) > .00001) {
    next.phase = 'summon'; next.elapsed = 0; next.direction = distance > 0 ? 1 : -1;
  } else if (next.phase === 'summon' && next.elapsed >= 2) {
    next.phase = Math.abs(distance) > .00001 ? 'travel' : 'settle'; next.elapsed = 0;
  } else if (next.phase === 'travel') {
    if (distance) next.direction = distance > 0 ? 1 : -1;
    const step = Math.min(Math.abs(distance), Math.min(.18, Math.abs(distance) * 1.8 + .008) * Math.max(0, dt));
    next.progress += next.direction * step;
    if (Math.abs(target - next.progress) <= .00001) { next.progress = target; next.phase = 'settle'; next.elapsed = 0; }
  } else if (next.phase === 'settle' && next.elapsed >= 2) {
    next.phase = 'idle'; next.elapsed = 0;
  }
  return next;
}
