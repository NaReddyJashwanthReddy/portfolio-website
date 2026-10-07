import { useEffect, useRef, useState } from 'react';
import { clamp, contain, destination, ease, flightKind, flightPoint, roamBounds } from './guardian-routes';
import type { FlightKind, Point } from './guardian-routes';

const ASSETS = '/assets/skygarden/guardian/';
type Phase = 'idle' | 'summon' | 'travel' | 'settle' | 'center' | 'exhale';
type Atlas = { image: HTMLImageElement; width: number; height: number; columns: number };
const between = (min: number, max: number) => min + Math.random() * Math.max(0, max - min);

/** The guardian chooses its own destinations; the pointer only greets it. */
export function RealmGuardian({ moving, entering = false, sceneKey = '', followJourney = false, onCentered }: { moving: boolean; entering?: boolean; sceneKey?: string; followJourney?: boolean; onCentered?: (mouth: Point) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const companion = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const images = useRef<{ idle: Atlas; travel: Atlas; clouds: Atlas; hover: HTMLImageElement; breath: HTMLImageElement } | null>(null);
  const command = useRef({ entering, onCentered, followJourney });
  command.current = { entering, onCentered, followJourney };
  const greeting = useRef({ pointer: false, focus: false, touch: false });
  const world = useRef({ width: 0, height: 0, size: 520, copy: { left: 0, right: 0, top: 0, bottom: 0 } });
  const state = useRef({ phase: 'idle' as Phase, time: 0, elapsed: 0, wait: 3.5, duration: 6,
    position: { x: 0, y: 0 }, from: { x: 0, y: 0 }, target: { x: 0, y: 0 }, right: false,
    hover: 0, opacity: 1, initialized: false, recent: [] as Point[], bend: 0, scale: 1, mode: 'diagonal' as FlightKind,
    pathProgress: -1, pathTravelUntil: 0 });

  useEffect(() => {
    const s = state.current, w = world.current;
    if (!entering) {
      if (s.phase === 'center' || s.phase === 'exhale') { s.phase = 'settle'; s.elapsed = 0; s.scale = 1; s.wait = between(1, 3); }
      return;
    }
    greeting.current = { pointer: false, focus: false, touch: false };
    s.phase = 'center'; s.elapsed = 0; s.from = { ...s.position };
    s.target = { x: w.width / 2, y: Math.min(w.height, window.innerHeight) * .57 + w.size * .08 };
    s.right = s.target.x > s.position.x; s.duration = 1.85;
  }, [entering]);

  useEffect(() => {
    let cancelled = false;
    const load = async (name: string) => {
      const image = new Image(); image.src = `${ASSETS}${name}`;
      await image.decode(); return image;
    };
    Promise.all(['idle-atlas.webp', 'travel-atlas.webp', 'cloud-atlas.webp', 'hover-front.webp', 'exhale-front.webp'].map(load))
      .then(([idle, travel, clouds, hover, breath]) => {
        if (cancelled) return;
        images.current = { idle: { image: idle, width: 400, height: 275, columns: 10 },
          travel: { image: travel, width: 400, height: 275, columns: 10 },
          clouds: { image: clouds, width: 320, height: 240, columns: 3 }, hover, breath };
        setReady(true);
      }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; images.current = null; };
  }, []);

  useEffect(() => {
    const host = stage.current, button = companion.current;
    if (!host || !button) return;
    const measure = () => {
      const box = host.getBoundingClientRect(), size = button.offsetWidth;
      const copy = host.closest('.sky-app')?.querySelector('[data-guardian-copy], .sky-garden-copy')?.getBoundingClientRect();
      world.current = { width: box.width, height: box.height, size, copy: {
        left: (copy?.left ?? 0) - box.left, right: (copy?.right ?? 0) - box.left,
        top: (copy?.top ?? 0) - box.top - (box.width < 761 ? 0 : 50), bottom: (copy?.bottom ?? 0) - box.top,
      } };
      const s = state.current;
      const w = world.current;
      const journeyPath = command.current.followJourney && w.width >= 760
        ? host.closest('.sky-app')?.querySelector<HTMLElement>('[data-guardian-path]') : null;
      if (journeyPath && !command.current.entering) {
        const path = journeyPath.getBoundingClientRect();
        // Ride lower on the desktop bridge so the first chapter stays readable.
        s.position = { x: path.left, y: path.top + size * .16 };
        s.right = journeyPath.dataset.direction !== 'left';
        s.initialized = true;
      } else if (!s.initialized) {
        s.position = { x: w.width < 761 ? w.width * .52 : w.width * .73,
          y: w.width < 761 ? w.height * .34 : w.height * .42 };
        s.initialized = true;
      }
      if (command.current.entering) return;
      // Resize cancels a destination outside the newly sized scene.
      s.position = contain(s.position, roamBounds(w.width, w.height, w.size)); s.phase = 'idle'; s.elapsed = 0;
      s.recent = [];
      s.from = { ...s.position }; s.target = { ...s.position };
      button.style.transform = `translate3d(${s.position.x - size / 2}px, ${s.position.y - size * .46875}px, 0)`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host); observer.observe(button);
    const copy = host.closest('.sky-app')?.querySelector('[data-guardian-copy], .sky-garden-copy');
    if (copy) observer.observe(copy);
    measure();
    return () => observer.disconnect();
  }, [sceneKey]);

  useEffect(() => {
    const context = canvas.current?.getContext('2d'), button = companion.current, host = stage.current;
    if (!context || !button || !host || !ready || !images.current) return;
    const copyNode = host.closest('.sky-app')?.querySelector('[data-guardian-copy], .sky-garden-copy');
    const pathNode = followJourney ? host.closest('.sky-app')?.querySelector<HTMLElement>('[data-guardian-path]') : null;
    state.current.pathProgress = -1;
    let frame = 0, last = 0;
    let intersecting = true;
    let visible = !document.hidden;
    const atlas = (source: Atlas, index: number, dx: number, dy: number, dw: number, dh: number, opacity = 1, mirror = false) => {
      if (opacity < .002) return;
      context.save(); context.globalAlpha = opacity;
      if (mirror) { context.translate(640, 0); context.scale(-1, 1); }
      context.drawImage(source.image, index % source.columns * source.width, Math.floor(index / source.columns) * source.height,
        source.width, source.height, dx, dy, dw, dh);
      context.restore();
    };
    const render = (now: number) => {
      const dt = moving && visible && last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      const s = state.current, w = world.current, art = images.current!;
      const copyRect = copyNode?.getBoundingClientRect();
      if (copyRect) w.copy = { left: copyRect.left, right: copyRect.right, top: copyRect.top - (w.width < 761 ? 0 : 50), bottom: copyRect.bottom };
      const held = !command.current.entering && (greeting.current.pointer || greeting.current.focus || greeting.current.touch);
      const bounds = roamBounds(w.width, w.height, w.size);
      let justCentered = false;
      s.time += dt;
      const frontal = s.phase === 'exhale' ? 1 : s.phase === 'center' ? ease(clamp((s.elapsed / s.duration - .55) / .45, 0, 1)) : held ? 1 : 0;
      s.hover += (frontal - s.hover) * (1 - Math.exp(-dt * 10));
      if (held && (s.phase === 'travel' || s.phase === 'summon')) { s.phase = 'settle'; s.elapsed = 0; }
      s.elapsed += dt;
      if (s.phase === 'center') {
        const progress = ease(clamp(s.elapsed / s.duration, 0, 1));
        s.position = { x: s.from.x + (s.target.x - s.from.x) * progress, y: s.from.y + (s.target.y - s.from.y) * progress };
        s.scale = 1 + progress * .16;
        if (s.elapsed >= s.duration) { s.phase = 'exhale'; s.elapsed = 0; justCentered = true; }
      } else if (s.phase === 'exhale') { s.hover = 1; }
      else if (pathNode && command.current.followJourney) {
        const pathRect = pathNode.getBoundingClientRect();
        const progress = Number(pathNode.dataset.progress ?? 0);
        if (s.pathProgress < 0 && w.width >= 760) s.right = pathNode.dataset.direction !== 'left';
        if (s.pathProgress >= 0 && Math.abs(progress - s.pathProgress) > .00001) {
          s.right = progress > s.pathProgress;
          s.pathTravelUntil = now + 450;
        }
        s.pathProgress = progress;
        // Scroll controls position even while ambient animation is paused.
        s.position = { x: pathRect.left, y: pathRect.top + w.size * (w.width >= 760 ? .16 : -.16) };
        if (!moving || held) { s.phase = 'idle'; s.elapsed = 0; }
        else if (now < s.pathTravelUntil) { s.phase = 'travel'; s.elapsed = 0; }
        else if (s.phase === 'travel') { s.phase = 'settle'; s.elapsed = 0; }
        else if (s.phase === 'settle' && s.elapsed >= 1.6) { s.phase = 'idle'; s.elapsed = 0; }
        s.scale = 1;
      }
      else if (s.phase === 'idle' && !held && s.elapsed > s.wait) {
        s.from = { ...s.position };
        s.mode = flightKind();
        const target = destination(s.position, bounds, s.mode, Math.random, s.recent);
        s.recent = [...s.recent, { ...s.position }].slice(-6);
        const distance = Math.hypot(target.x - s.position.x, target.y - s.position.y);
        s.bend = between(-1, 1) * Math.min(distance * .3, 130);
        s.target = target; s.right = target.x > s.position.x;
        if (s.mode === 'vertical') s.right = Math.random() > .5;
        s.duration = clamp(distance / between(65, 100), 2.8, 13);
        s.phase = 'summon'; s.elapsed = 0;
      } else if (s.phase === 'summon' && s.elapsed >= 1.6) { s.phase = 'travel'; s.elapsed = 0; }
      else if (s.phase === 'travel') {
        s.position = flightPoint(s.from, s.target, s.elapsed / s.duration, bounds, s.bend);
        if (s.elapsed >= s.duration) { s.phase = 'settle'; s.elapsed = 0; }
      } else if (s.phase === 'settle' && s.elapsed >= 1.6) { s.phase = 'idle'; s.elapsed = 0; s.wait = Math.random() < .2 ? between(6, 9) : between(.8, 3.5); }

      context.clearRect(0, 0, 640, 600);
      const cycle = Math.floor(s.time * 1000 / 45) % 80;
      const cloudProgress = s.phase === 'summon' ? clamp(s.elapsed / 1.6, 0, 1)
        : s.phase === 'settle' ? 1 - clamp(s.elapsed / 1.6, 0, 1) : s.phase === 'travel' || s.phase === 'center' ? 1 : 0;
      const cloudFrame = cloudProgress * 8, cloudIndex = Math.floor(cloudFrame);
      const cloudMix = cloudFrame - cloudIndex;
      const cloudAlpha = (1 - s.hover) * Math.min(cloudProgress * 3, 1);
      atlas(art.clouds, cloudIndex, 64, 140, 512, 384, cloudAlpha * (1 - cloudMix));
      if (cloudIndex < 8) atlas(art.clouds, cloudIndex + 1, 64, 140, 512, 384, cloudAlpha * cloudMix);
      const bob = s.phase === 'travel' ? Math.sin(s.time * 1.2) * 5 : 0;
      const profile = s.phase === 'travel' || s.phase === 'center' ? 1 : s.phase === 'summon' ? ease(clamp(s.elapsed / .65, 0, 1))
        : s.phase === 'settle' ? 1 - ease(clamp(s.elapsed / .65, 0, 1)) : 0;
      atlas(art.idle, cycle, 0, bob - cloudProgress * 9, 640, 440, (1 - profile) * (1 - s.hover));
      atlas(art.travel, cycle, 0, bob - cloudProgress * 9, 640, 440, profile * (1 - s.hover), s.right);
      if (s.hover > .002) {
        context.save(); context.globalAlpha = s.hover;
        const exhale = s.phase === 'exhale' ? ease(clamp(s.elapsed / .35, 0, 1)) : 0;
        context.globalAlpha = s.hover * (1 - exhale); context.drawImage(art.hover, 32, 0, 576, 432);
        if (exhale > 0) { context.globalAlpha = s.hover * exhale; context.drawImage(art.breath, 32, 0, 576, 432); }
        context.restore();
      }
      button.style.transform = `translate3d(${s.position.x - w.size / 2}px, ${s.position.y - w.size * .46875}px, 0) scale(${s.scale})`;
      // Passing behind the copy feels like a deeper cloud layer, without blocking its controls.
      const body = { left: s.position.x - w.size * .48, right: s.position.x + w.size * .48,
        top: s.position.y - w.size * .47, bottom: s.position.y + w.size * .23 };
      const overlap = Math.max(0, Math.min(body.right, w.copy.right) - Math.max(body.left, w.copy.left))
        * Math.max(0, Math.min(body.bottom, w.copy.bottom) - Math.max(body.top, w.copy.top));
      const coverage = clamp(overlap / (w.size * w.size * .96 * .7) * 4, 0, 1);
      const opacity = command.current.entering || command.current.followJourney ? 1 : 1 - ease(coverage) * .8;
      s.opacity = moving ? s.opacity + (opacity - s.opacity) * (1 - Math.exp(-dt * 5)) : opacity;
      button.style.opacity = String(s.opacity);
      button.dataset.phase = held ? 'hover' : s.phase;
      button.dataset.frame = String(cycle);
      button.dataset.direction = s.right ? 'right' : 'left';
      button.dataset.flight = s.mode;
      button.dataset.target = `${s.target.x.toFixed(1)},${s.target.y.toFixed(1)}`;
      button.dataset.guided = String(command.current.followJourney && !command.current.entering);
      if (justCentered) {
        const rect = button.getBoundingClientRect();
        command.current.onCentered?.({ x: rect.left + rect.width * .48, y: rect.top + rect.width * .28 });
      }
      if (moving && visible) frame = requestAnimationFrame(render);
    };
    const visibility = () => {
      visible = intersecting && !document.hidden; cancelAnimationFrame(frame); last = 0;
      if (visible) frame = requestAnimationFrame(render);
    };
    // No animation work while paused, off-screen, or in a background tab.
    const observer = new IntersectionObserver(entries => {
      intersecting = entries[0].isIntersecting;
      visible = intersecting && !document.hidden; cancelAnimationFrame(frame); last = 0;
      if (visible) frame = requestAnimationFrame(render);
    });
    observer.observe(host);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('scroll', visibility, { passive: true });
    window.addEventListener('resize', visibility, { passive: true });
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('scroll', visibility); window.removeEventListener('resize', visibility); };
  }, [moving, ready, entering, sceneKey, followJourney]);

  return <div className="sky-roaming-stage" ref={stage}>
    <button ref={companion} className="sky-realm-guardian" aria-label="Greet the dragon guardian" title="Say hello"
      disabled={entering} onPointerEnter={event => { if (event.pointerType !== 'touch') greeting.current.pointer = true; }}
      onPointerLeave={() => { greeting.current.pointer = false; }}
      onPointerDown={event => { if (event.pointerType === 'touch') greeting.current.touch = !greeting.current.touch; }}
      onFocus={event => { greeting.current.focus = event.currentTarget.matches(':focus-visible'); }}
      onBlur={() => { greeting.current.focus = false; greeting.current.touch = false; }}>
      <img className={`sky-guardian-poster ${ready ? 'sky-guardian-loaded' : ''}`} src={`${ASSETS}idle-poster.webp`} alt="" />
      {!failed && <canvas ref={canvas} width={640} height={600} className={ready ? 'sky-guardian-loaded' : ''} aria-hidden="true" />}
    </button>
  </div>;
}
