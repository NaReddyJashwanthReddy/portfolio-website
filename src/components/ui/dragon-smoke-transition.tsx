import { useEffect, useRef, useState } from 'react';
import type { Point } from './guardian-routes';
import { clamp, ease } from './guardian-routes';
import { GuardianTextures, guardianBase } from './guardian-animation';
import type { GuardianManifest } from './guardian-animation';

type Plume = { born: number; angle: number; spread: number; spin: number; seed: number };
const flameStart = 2;

/** The companion's black/gold/crimson flame curls expand into a full-screen breath. */
export function DragonSmokeTransition({ origin, active = true, reveal, onCovered, onFinished }: {
  origin: Point; active?: boolean; reveal: boolean; onCovered: () => void; onFinished: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [profile] = useState(() => innerWidth < 761 ? 'mobile' : 'desktop');
  const art = useRef<GuardianTextures | null>(null);
  const callbacks = useRef({ onCovered, onFinished });
  callbacks.current = { onCovered, onFinished };
  const revealing = useRef(reveal); revealing.current = reveal;

  // Mount during the gather phase to prepare the first flame pages before the jaw opens.
  useEffect(() => {
    let cancelled = false;
    let cache: GuardianTextures | undefined;
    void (async () => {
      const base = guardianBase + profile + '/';
      const response = await fetch(base + 'manifest.json');
      if (!response.ok) throw new Error('Flame manifest unavailable');
      const manifest = await response.json() as GuardianManifest;
      if (cancelled) return;
      cache = new GuardianTextures(manifest, base); art.current = cache;
      const page = Math.floor(flameStart * manifest.animations.fire.fps / manifest.pageFrames);
      await Promise.allSettled(manifest.animations.fire.pages.slice(page, page + 3).map(file => cache!.load(file)));
    })().catch(() => { /* A matching vector fallback keeps navigation independent of loading. */ });
    return () => { cancelled = true; cache?.dispose(); art.current = null; };
  }, [profile]);

  useEffect(() => {
    const element = canvas.current, context = element?.getContext('2d');
    if (!element || !context) return;
    element.style.opacity = active ? '1' : '0';
    if (!active) { context.clearRect(0, 0, element.width, element.height); return; }
    let width = innerWidth, height = innerHeight, frame = 0, last = 0, time = 0;
    let covered = false, revealTime = 0, accumulator = 1, flameTime = flameStart;
    let sample: ReturnType<GuardianTextures['sample']> = null;
    let nativeReady: boolean | undefined;
    const plumes: Plume[] = [];
    const bank = document.createElement('canvas'), bankPaint = bank.getContext('2d')!;
    // Gold-edged black curls and occasional crimson veins also work offline.
    const fallback = document.createElement('canvas'); fallback.width = 384; fallback.height = 200;
    const paint = fallback.getContext('2d')!;
    for (let i = 17; i >= 0; i--) {
      const x = 12 + i * 20, radius = 8 + i * 3.9, y = 100 + Math.sin(i * 2.4) * radius * .32;
      paint.save(); paint.translate(x, y); paint.rotate(Math.sin(i * 1.7) * .5);
      paint.beginPath(); paint.moveTo(-radius, 0);
      paint.bezierCurveTo(-radius * .3, -radius * .9, radius * .45, -radius * .35, radius, -radius);
      paint.bezierCurveTo(radius * .8, -radius * .1, radius * .12, -radius * .15, radius * .42, radius * .14);
      paint.bezierCurveTo(radius * .75, radius * .6, radius * 1.1, radius * .4, radius * 1.2, radius * .85);
      paint.bezierCurveTo(radius * .25, radius * .45, -radius * .7, radius * .8, -radius, 0);
      const heat = paint.createRadialGradient(0, 0, 0, radius * .2, 0, radius * 1.25);
      const crimson = i % 7 === 3;
      heat.addColorStop(0, '#070608'); heat.addColorStop(.55, '#171310');
      heat.addColorStop(.84, crimson ? '#95051c' : '#9c681a');
      heat.addColorStop(1, crimson ? '#c3092b' : '#ffe6a0');
      paint.fillStyle = heat; paint.shadowBlur = 12; paint.shadowColor = crimson ? '#95051c' : '#d9a13c'; paint.fill();
      paint.strokeStyle = crimson ? '#c3092b' : '#f3c76a'; paint.lineWidth = 1.7; paint.stroke(); paint.restore();
    }
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);
    const render = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; time += dt;
      context.clearRect(0, 0, width, height);
      const reach = Math.hypot(width, height);
      // Opaque coverage underneath the flame detail hides the destination at the commit.
      const fill = ease(clamp((time - 1.85) / 1.15, 0, 1));
      context.fillStyle = `rgba(10,8,9,${fill})`; context.fillRect(0, 0, width, height);
      {
        // Choose once: a late first download must not replace visible fallback fire
        // with the animation's initially empty frame halfway through the breath.
        nativeReady ??= !!art.current?.sample('fire', flameStart);
        const next = nativeReady ? art.current?.sample('fire', flameTime + dt) : null;
        if (next) { sample = next; flameTime += dt; }
        const source = sample?.image ?? fallback;
        const sx = sample?.sx ?? 0, sy = sample?.sy ?? 0;
        const sw = sample?.spec.width ?? fallback.width, sh = sample?.spec.height ?? fallback.height;
        accumulator += dt * 22;
        while (accumulator >= 1 && plumes.length < 64) {
          const seed = plumes.length;
          plumes.push({ born: time, angle: seed * 2.39996, spread: .45 + (seed % 13) / 18,
            spin: (seed % 2 ? 1 : -1) * .28, seed }); accumulator--;
        }
        // Use the mature flame curls immediately, feathering away the nozzle.
        // Every bank spreads radially from the muzzle without a preliminary jet.
        const bankWidth = Math.ceil(sw * .72);
        if (bank.width !== bankWidth || bank.height !== sh) { bank.width = bankWidth; bank.height = sh; }
        bankPaint.clearRect(0, 0, bankWidth, sh);
        bankPaint.drawImage(source, sx + sw * .28, sy, sw * .72, sh, 0, 0, bankWidth, sh);
        bankPaint.save(); bankPaint.globalCompositeOperation = 'destination-in';
        const feather = bankPaint.createLinearGradient(0, 0, bankWidth, 0);
        feather.addColorStop(0, '#0000'); feather.addColorStop(.24, '#000b'); feather.addColorStop(.45, '#000'); feather.addColorStop(.94, '#000'); feather.addColorStop(1, '#0000');
        bankPaint.fillStyle = feather; bankPaint.fillRect(0, 0, bankWidth, sh); bankPaint.restore();
        for (const puff of plumes) {
          const age = Math.max(0, time - puff.born), depth = clamp(age / 1.8, 0, 1);
          const travel = reach * depth ** 1.5 * puff.spread * .55;
          const x = origin.x + Math.cos(puff.angle) * travel;
          const y = origin.y + Math.sin(puff.angle) * travel * .8 - age * 14;
          const radius = 6 + depth ** 1.4 * reach * (.15 + puff.seed % 5 * .016);
          const scale = radius * 2 / sh;
          context.save(); context.translate(x, y); context.rotate(puff.angle * .2 + age * puff.spin);
          context.globalAlpha = clamp(age * 5, 0, .88);
          context.drawImage(bank, -bankWidth * scale / 2, -radius, bankWidth * scale, radius * 2);
          context.restore();
        }
        const radius = 8 + ease(clamp(time / 2.4, 0, 1)) * reach * .32;
        const scale = radius * 2 / sh;
        context.save(); context.translate(origin.x, origin.y);
        context.rotate(time * .24);
        context.drawImage(bank, -bankWidth * scale / 2, -radius, bankWidth * scale, radius * 2);
        context.restore();
      }
      element.dataset.coverage = fill.toFixed(3);
      element.dataset.flameFrame = String(sample?.frame ?? -1);
      element.dataset.style = 'black-gold-crimson-breath';
      element.dataset.spread = 'radial';
      if (time >= 3 && !covered) { covered = true; callbacks.current.onCovered(); }
      if (revealing.current) {
        revealTime += dt; element.style.opacity = String(1 - ease(clamp(revealTime / .85, 0, 1)));
        if (revealTime >= .85) { callbacks.current.onFinished(); return; }
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [origin.x, origin.y, active]);

  return <div className="sky-smoke-overlay" style={{ pointerEvents: active ? 'auto' : 'none' }} role="status" aria-label="The dragon breathes black flames with gold and crimson light to reveal the next page" aria-hidden={!active}>
    <canvas ref={canvas} aria-hidden="true" />
  </div>;
}
