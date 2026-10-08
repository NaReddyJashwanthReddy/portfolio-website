export type Point = { x: number; y: number };
export type FlightKind = 'vertical' | 'diagonal' | 'horizontal';
export type RoamBounds = { left: number; right: number; top: number; bottom: number };
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

export function roamBounds(width: number, height: number, size: number): RoamBounds {
  const right = Math.max(size * .38 + 12, width - size * .47 - 14);
  const left = size * .38 + 12;
  // Leave room for the silhouette and navigation, but allow both sides and the lower clouds.
  // Text and buttons are layered above the guardian rather than fencing off its routes.
  const bottom = height - size * .25 - 48;
  const top = Math.min(bottom - 70, (width < 761 ? 88 : 104) + size * .38);
  return { left, right, top, bottom };
}

export function contain(point: Point, bounds: RoamBounds): Point {
  return { x: clamp(point.x, bounds.left, bounds.right), y: clamp(point.y, bounds.top, bounds.bottom) };
}

export function flightKind(random = Math.random): FlightKind {
  const choice = random();
  return choice < .18 ? 'vertical' : choice < .32 ? 'horizontal' : 'diagonal';
}

export type RoamingMemory = { visits: number[]; recent: number[] };
export const roamingMemory = (): RoamingMemory => ({ visits: Array(24).fill(0), recent: [] });

/** Prefer less-used regions without repeating a recent destination or a fixed route. */
export function rememberedDestination(from: Point, bounds: RoamBounds, memory: RoamingMemory, random = Math.random): { point: Point; kind: FlightKind } {
  const sx = Math.max(1, bounds.right - bounds.left), sy = Math.max(1, bounds.bottom - bounds.top);
  const choice = random(), kind: FlightKind = choice < .3 ? 'horizontal' : choice < .85 ? 'diagonal' : 'vertical';
  const candidates = memory.visits.map((visits, cell) => ({ cell, weight: 1 / (1 + visits) ** 1.5,
    point: { x: bounds.left + (cell % 4 + .15 + random() * .7) / 4 * sx,
      y: bounds.top + (Math.floor(cell / 4) + .15 + random() * .7) / 6 * sy } }));
  const fresh = candidates.filter(candidate => !memory.recent.includes(candidate.cell));
  const matching = fresh.filter(({ point }) => {
    const dx = Math.abs(point.x - from.x), dy = Math.abs(point.y - from.y);
    return kind === 'horizontal' ? dx >= sx * .35 && dy <= sy * .12
      : kind === 'diagonal' ? dx >= sx * .3 && dy >= sy * .08 && dy <= Math.max(sy * .22, sx * 1.15)
      : dx <= sx * .18 && dy >= sy * .18;
  });
  const pool = matching.length ? matching : fresh;
  let pick = random() * pool.reduce((sum, candidate) => sum + candidate.weight, 0);
  const selected = pool.find(candidate => (pick -= candidate.weight) <= 0) ?? pool[pool.length - 1];
  memory.visits[selected.cell]++; memory.recent = [...memory.recent, selected.cell].slice(-6);
  return { point: selected.point, kind };
}

/** Sample the whole scene, mixing short and long trips and favoring places not visited recently. */
export function destination(from: Point, bounds: RoamBounds, kind: FlightKind, random = Math.random, recent: Point[] = []): Point {
  const spanX = bounds.right - bounds.left, spanY = bounds.bottom - bounds.top;
  const range = kind === 'vertical' ? spanY : kind === 'horizontal' ? spanX : Math.hypot(spanX, spanY);
  const preferredDistance = range * (.2 + random() * .65);
  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  let best = { ...from }, bestScore = -Infinity;
  for (let i = 0; i < 28; i++) {
    const point = {
      x: kind === 'vertical' ? from.x : bounds.left + random() * spanX,
      y: kind === 'horizontal' ? from.y : bounds.top + random() * spanY,
    };
    const travel = distance(from, point);
    if (travel < range * .13) continue;
    // Compare each axis relative to its available span, so a wide desktop doesn't
    // favor horizontal exploration while neglecting upper and lower destinations.
    const novelty = Math.min(...[from, ...recent].map(stop => Math.hypot(
      (stop.x - point.x) / Math.max(spanX, 1), (stop.y - point.y) / Math.max(spanY, 1),
    ))) / Math.SQRT2;
    const score = novelty * .6 - Math.abs(travel - preferredDistance) / Math.max(range, 1) * .35 + random() * .25;
    if (score > bestScore) { best = point; bestScore = score; }
  }
  if (bestScore === -Infinity) {
    // A constant or unlucky RNG still produces a meaningful trip.
    best = {
      x: kind === 'vertical' ? from.x : from.x < (bounds.left + bounds.right) / 2 ? bounds.right : bounds.left,
      y: kind === 'horizontal' ? from.y : from.y < (bounds.top + bounds.bottom) / 2 ? bounds.bottom : bounds.top,
    };
  }
  return best;
}

/** A randomized quadratic arc stays inside the scene without snapping against its edges. */
export function flightPoint(from: Point, to: Point, t: number, bounds: RoamBounds, bend = 0): Point {
  const progress = ease(clamp(t, 0, 1));
  const dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy) || 1;
  const control = contain({ x: (from.x + to.x) / 2 - dy / length * bend,
    y: (from.y + to.y) / 2 + dx / length * bend }, bounds);
  const rest = 1 - progress;
  return { x: rest * rest * from.x + 2 * rest * progress * control.x + progress * progress * to.x,
    y: rest * rest * from.y + 2 * rest * progress * control.y + progress * progress * to.y };
}
