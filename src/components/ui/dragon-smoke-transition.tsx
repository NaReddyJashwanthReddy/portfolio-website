import { useEffect, useRef } from 'react';
import type { Point } from './guardian-routes';
import { clamp, ease } from './guardian-routes';

type Plume = { born: number; angle: number; spread: number; spin: number; seed: number; texture: number };

/** Billowing black breath grows from the muzzle toward the camera, then fills every edge. */
export function DragonSmokeTransition({ origin, reveal, onCovered, onFinished }: {
  origin: Point; reveal: boolean; onCovered: () => void; onFinished: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onCovered, onFinished });
  callbacks.current = { onCovered, onFinished };
  const revealing = useRef(false);
  revealing.current = reveal;

  useEffect(() => {
    const element = canvas.current, context = element?.getContext('2d');
    if (!element || !context) return;
    let width = innerWidth, height = innerHeight, frame = 0, last = 0, time = 0;
    let covered = false, revealTime = 0, accumulator = 0;
    const plumes: Plume[] = [];
    const textures = Array.from({ length: 6 }, (_, index) => {
      const texture = document.createElement('canvas'); texture.width = texture.height = 256;
      const paint = texture.getContext('2d')!;
      // Deterministic textured lobes avoid a field of identical circles.
      for (let i = 0; i < 27; i++) {
        const angle = i * 2.399 + index * .7, distance = (i % 7) * 7;
        const x = 128 + Math.cos(angle) * distance, y = 128 + Math.sin(angle) * distance;
        const radius = 46 + ((i * 13 + index * 17) % 43);
        const gradient = paint.createRadialGradient(x - 6, y - 9, 0, x, y, radius);
        gradient.addColorStop(0, i % 3 ? 'rgba(17,16,22,.72)' : 'rgba(43,39,48,.65)');
        gradient.addColorStop(.48, 'rgba(12,11,17,.85)');
        gradient.addColorStop(1, 'rgba(9,8,13,0)');
        paint.fillStyle = gradient; paint.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
      return texture;
    });
    const resize = () => {
      width = innerWidth; height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio); element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize(); window.addEventListener('resize', resize);
    const render = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
      time += dt;
      context.clearRect(0, 0, width, height);
      const start = .16; // Let the jaw open before the first black flame leaves it.
      const breath = Math.max(0, time - start);
      accumulator += dt * (breath > 0 ? 68 : 0);
      while (accumulator >= 1 && plumes.length < 230) {
        const seed = plumes.length;
        plumes.push({ born: time, angle: seed * 2.39996, spread: .35 + (seed % 13) / 13,
          spin: (seed % 2 ? 1 : -1) * .15, seed, texture: seed % textures.length });
        accumulator--;
      }
      const reach = Math.hypot(width, height);
      for (const puff of plumes) {
        const age = Math.max(0, time - puff.born);
        const depth = clamp(age / 1.8, 0, 1);
        const travel = reach * Math.pow(depth, 1.55) * puff.spread * .55;
        const x = origin.x + Math.cos(puff.angle) * travel;
        const y = origin.y + Math.sin(puff.angle) * travel * .8 - age * 22;
        const radius = 15 + Math.pow(depth, 1.4) * reach * (.17 + (puff.seed % 5) * .018);
        context.save(); context.translate(x, y); context.rotate(puff.angle * .13 + age * puff.spin);
        context.globalAlpha = Math.min(age * 7, .95);
        context.drawImage(textures[puff.texture], -radius, -radius, radius * 2, radius * 2);
        context.restore();
      }
      // A writhing dark flame at the muzzle feeds the larger, softer smoke banks.
      if (breath > 0 && time < 2.5) {
        const length = 18 + clamp(breath, 0, 1) * 35;
        context.save(); context.translate(origin.x, origin.y);
        context.globalAlpha = .85 * (1 - clamp((breath - .55) / .6, 0, 1));
        context.fillStyle = '#100b17'; context.shadowBlur = 18; context.shadowColor = '#47364c';
        context.beginPath(); context.moveTo(-7, -2);
        context.bezierCurveTo(-22, 26, -length * .42, 12 + Math.sin(time * 9) * 12, -length * .6, length * .65);
        context.bezierCurveTo(-length * .15, length * .45, length * .14, length * .65, length * .33, length);
        context.bezierCurveTo(length * .25, length * .38, 23, 19, 7, -2); context.closePath(); context.fill();
        context.restore();
      }
      // Guaranteed opaque coverage before the destination is mounted, including corners.
      const fill = ease(clamp((time - 1.85) / 1.15, 0, 1));
      context.fillStyle = `rgba(9,8,13,${fill})`; context.fillRect(0, 0, width, height);
      element.dataset.coverage = fill.toFixed(3);
      if (time >= 3 && !covered) { covered = true; callbacks.current.onCovered(); }
      if (revealing.current) {
        revealTime += dt;
        element.style.opacity = String(1 - ease(clamp(revealTime / .85, 0, 1)));
        if (revealTime >= .85) { callbacks.current.onFinished(); return; }
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [origin.x, origin.y]);

  return <div className="sky-smoke-overlay" role="status" aria-label="The dragon breathes black smoke to reveal the next page">
    <canvas ref={canvas} aria-hidden="true" />
  </div>;
}
