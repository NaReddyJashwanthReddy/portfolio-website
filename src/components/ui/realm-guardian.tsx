import { useEffect, useRef, useState } from 'react';
import { clamp, contain, ease, flightPoint, rememberedDestination, roamBounds, roamingMemory } from './guardian-routes';
import type { FlightKind, Point } from './guardian-routes';
import { GuardianTextures, guardianBase } from './guardian-animation';
import type { GuardianClip, GuardianManifest } from './guardian-animation';
import { advanceJourney, journeyMotion } from './journey-motion';

type Phase = 'idle' | 'summon' | 'travel' | 'settle' | 'center' | 'exhale' | 'breath-prepare' | 'breath' | 'breath-recover';
const between = (min: number, max: number) => min + Math.random() * (max - min);
const surface = () => { const c = document.createElement('canvas'); c.width = 640; c.height = 600; return c; };

/** One companion persists across routes; the journey keeps its bridge choreography. */
export function RealmGuardian({ moving, entering = false, sceneKey = '', followJourney = false, onCentered }: { moving: boolean; entering?: boolean; sceneKey?: string; followJourney?: boolean; onCentered?: (mouth: Point) => void }) {
  const stage = useRef<HTMLDivElement>(null), companion = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null), effects = useRef<HTMLCanvasElement>(null);
  const [profile] = useState(() => innerWidth < 761 ? 'mobile' : 'desktop');
  const [ready, setReady] = useState(false);
  const textures = useRef<GuardianTextures | null>(null), exhale = useRef<HTMLImageElement | null>(null);
  const journeyPath = useRef<HTMLElement | null>(null);
  const command = useRef({ entering, onCentered, followJourney, moving });
  command.current = { entering, onCentered, followJourney, moving };
  const wake = useRef(() => {}), transformRequested = useRef(false);
  const greeting = useRef({ until: 0, pointer: false, focus: false });
  const drag = useRef<{ id: number; start: Point; origin: Point; active: boolean } | null>(null);
  const world = useRef({ width: 0, height: 0, size: 520 });
  const state = useRef({ phase: 'idle' as Phase, time: 0, elapsed: 0, wait: 3.5, duration: 6,
    position: { x: 0, y: 0 }, from: { x: 0, y: 0 }, target: { x: 0, y: 0 }, right: false,
    opacity: 1, initialized: false, memory: roamingMemory(), bend: 0, scale: 1, mode: 'diagonal' as FlightKind,
    form: 'dragon' as 'dragon' | 'human', nextForm: 70, nextBreath: 24, transformAt: -10,
    bodyKey: '', bodySeconds: 0, bodyFrame: 0,
    journey: journeyMotion() });

  useEffect(() => {
    let cancelled = false;
    let cache: GuardianTextures | undefined;
    const base = guardianBase + profile + '/';
    void (async () => {
      const response = await fetch(base + 'manifest.json');
      if (!response.ok) throw new Error('Guardian manifest unavailable');
      const manifest = await response.json() as GuardianManifest;
      if (cancelled) return;
      cache = new GuardianTextures(manifest, base, () => wake.current());
      await cache.warm('idle');
      if (cancelled) { cache.dispose(); return; }
      textures.current = cache; setReady(true);
      // These may arrive later; the renderer holds the last complete pose meanwhile.
      void Promise.allSettled(['left', 'right', 'hover', 'cloud_form', 'cloud_drift', 'cloud_dissolve'].map(clip => cache!.warm(clip as GuardianClip)));
      const front = new Image(); front.src = '/assets/skygarden/guardian/exhale-front.webp';
      void front.decode().then(() => { if (!cancelled) exhale.current = front; }).catch(() => {});
    })().catch(() => { /* The poster remains visible; navigation has its own fallback. */ });
    return () => { cancelled = true; cache?.dispose(); textures.current = null; exhale.current = null; };
  }, [profile]);

  useEffect(() => {
    const s = state.current, w = world.current;
    if (entering) {
      greeting.current.until = 0; drag.current = null; transformRequested.current = false;
      s.form = 'dragon'; s.phase = 'center'; s.elapsed = 0; s.from = { ...s.position };
      s.target = { x: w.width / 2, y: Math.min(w.height, innerHeight) * .57 + w.size * .08 };
      s.right = s.target.x > s.position.x; s.duration = 1.85;
    } else if (s.phase === 'center' || s.phase === 'exhale') {
      s.phase = 'idle'; s.elapsed = 0; s.scale = 1; s.wait = between(1, 3);
      s.nextBreath = s.time + between(18, 38);
    }
    if (followJourney) { s.form = 'dragon'; greeting.current.until = 0; }
    wake.current();
  }, [entering, followJourney]);

  useEffect(() => {
    const host = stage.current, button = companion.current;
    if (!host || !button) return;
    const measure = () => {
      const box = host.getBoundingClientRect(), size = button.offsetWidth;
      world.current = { width: box.width, height: box.height, size };
      const s = state.current, w = world.current;
      const path = command.current.followJourney
        ? host.closest('.sky-app')?.querySelector<HTMLElement>('[data-guardian-path]') : null;
      if (path && !command.current.entering) {
        const rect = path.getBoundingClientRect();
        s.position = { x: rect.left, y: rect.top - size * .16 };
        s.right = path.dataset.direction !== 'left'; s.initialized = true;
      } else if (!s.initialized) {
        s.position = { x: w.width * (w.width < 761 ? .52 : .73), y: w.height * (w.width < 761 ? .34 : .42) };
        s.initialized = true;
      }
      if (command.current.entering) {
        // Rebase when entering changes the journey's sprite size.
        s.from = { ...s.position }; s.elapsed = 0;
        s.target = { x: w.width / 2, y: Math.min(w.height, innerHeight) * .57 + size * .08 };
      } else {
        if (!path) s.position = contain(s.position, roamBounds(w.width, w.height, size));
        s.phase = 'idle'; s.elapsed = 0; s.scale = 1;
        s.from = { ...s.position }; s.target = { ...s.position };
      }
      button.style.transform = `translate3d(${s.position.x - size / 2}px, ${s.position.y - size * .46875}px, 0)`;
      wake.current();
    };
    const observer = new ResizeObserver(measure); observer.observe(host); observer.observe(button); measure();
    return () => observer.disconnect();
  }, [sceneKey]);

  useEffect(() => {
    const context = canvas.current?.getContext('2d'), fx = effects.current?.getContext('2d');
    const button = companion.current, host = stage.current, cache = textures.current;
    if (!context || !fx || !button || !host || !ready || !cache) return;
    const manifest = cache.manifest;
    const artScale = 768 / manifest.width, ox = (640 - manifest.width * artScale) / 2, oy = 402.4 - manifest.feet * artScale;
    const pose = surface(), previous = surface(), target = surface(), cloud = surface();
    const pc = pose.getContext('2d')!, old = previous.getContext('2d')!, tc = target.getContext('2d')!, cc = cloud.getContext('2d')!;
    pc.drawImage(canvas.current!, 0, 0);
    let poseKey = state.current.bodyKey, changedAt = -10, blendSeconds = .9, displayedFrame = state.current.bodyFrame, poseBlend = 1;
    let lastFire: ReturnType<GuardianTextures['sample']> = null;
    let frame = 0, last = 0, intersecting = true, visible = !document.hidden;
    const pathNode = followJourney ? host.closest('.sky-app')?.querySelector<HTMLElement>('[data-guardian-path]') : null;
    if (pathNode && (pathNode !== journeyPath.current || Math.abs(state.current.journey.progress - Number(pathNode.dataset.progress ?? 0)) > .00001))
      state.current.journey = { ...journeyMotion(Number(pathNode.dataset.progress ?? 0)), direction: pathNode.dataset.direction === 'left' ? -1 : 1 };
    journeyPath.current = pathNode ?? null;
    const copyNode = host.closest('.sky-app')?.querySelector('[data-guardian-copy], .sky-garden-copy');
    const drawClip = (ctx: CanvasRenderingContext2D, clip: GuardianClip, seconds: number, mirror = false, trackFrame = true) => {
      const sample = cache.sample(clip, seconds); if (!sample) return false;
      const { image, spec, sx, sy } = sample;
      ctx.clearRect(0, 0, 640, 600); ctx.save();
      if (mirror) { ctx.translate(640, 0); ctx.scale(-1, 1); }
      ctx.drawImage(image, sx, sy, spec.width, spec.height, ox + spec.left * artScale, oy + spec.top * artScale, spec.width * artScale, spec.height * artScale);
      ctx.restore(); if (trackFrame) displayedFrame = sample.frame; return true;
    };
    const changeForm = () => {
      const s = state.current;
      s.form = s.form === 'dragon' ? 'human' : 'dragon';
      s.transformAt = s.time; s.nextForm = s.time + (s.form === 'human' ? between(20, 35) : between(65, 110));
      s.phase = 'idle'; s.elapsed = 0; s.wait = 2; greeting.current.until = 0;
      s.nextBreath = s.time + between(18, 38);
    };
    const render = (now: number) => {
      frame = 0;
      const dt = command.current.moving && visible && last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      const s = state.current, w = world.current, bounds = roamBounds(w.width, w.height, w.size);
      s.time += dt;
      let centered = false;
      const held = !command.current.entering && !command.current.followJourney && s.form === 'dragon' && s.time < greeting.current.until && !drag.current?.active;
      if (!held && !drag.current?.active) s.elapsed += dt;
      if (transformRequested.current && !command.current.entering && !command.current.followJourney) {
        transformRequested.current = false; changeForm();
      }
      if (s.phase === 'center') {
        const progress = ease(clamp(s.elapsed / s.duration, 0, 1));
        s.position = { x: s.from.x + (s.target.x - s.from.x) * progress, y: s.from.y + (s.target.y - s.from.y) * progress };
        s.scale = 1 + progress * .16;
        if (s.elapsed >= s.duration) { s.phase = 'exhale'; s.elapsed = 0; centered = true; }
      } else if (s.phase !== 'exhale' && pathNode && command.current.followJourney) {
        // The scene already follows scroll directly, even while textures load.
        // Holding a decoded pose must never create a backlog of camera movement.
        s.journey = advanceJourney(s.journey, Number(pathNode.dataset.progress ?? 0), dt, command.current.moving);
        s.phase = s.journey.phase; s.elapsed = s.journey.elapsed; s.right = s.journey.direction === 1;
        pathNode.dataset.phase = s.phase;
        pathNode.dataset.phaseTime = String(s.elapsed);
        const rect = pathNode.getBoundingClientRect();
        // Shared feet at 402.4/640 preserve the existing bridge anchor.
        s.position = { x: rect.left, y: rect.top - w.size * .16 };
        s.scale = 1;
      } else if (!held && !drag.current?.active && !command.current.entering) {
        if (s.phase === 'idle') {
          if (s.time >= s.nextForm) changeForm();
          else if (s.form === 'dragon' && s.time >= s.nextBreath) {
            s.right = s.position.x < w.width / 2; s.phase = 'breath-prepare'; s.elapsed = 0;
            void cache.warm('fire').catch(() => {});
          } else if (s.elapsed > s.wait) {
            const stop = rememberedDestination(s.position, bounds, s.memory);
            s.from = { ...s.position }; s.target = stop.point; s.mode = stop.kind;
            const distance = Math.hypot(s.target.x - s.position.x, s.target.y - s.position.y);
            s.right = s.target.x > s.position.x; s.bend = between(-1, 1) * Math.min(distance * .3, 130);
            s.duration = clamp(distance / between(65, 100), 2.8, 13); s.phase = s.form === 'human' ? 'travel' : 'summon'; s.elapsed = 0;
          }
        } else if (s.phase === 'summon' && s.elapsed >= manifest.cloudSeconds) { s.phase = 'travel'; s.elapsed = 0; }
        else if (s.phase === 'travel') {
          s.position = flightPoint(s.from, s.target, s.elapsed / s.duration, bounds, s.bend);
          if (s.elapsed >= s.duration) { s.phase = 'settle'; s.elapsed = 0; }
        } else if (s.phase === 'settle' && s.elapsed >= manifest.cloudSeconds) { s.phase = 'idle'; s.elapsed = 0; s.wait = between(.8, 3.5); }
        else if (s.phase === 'breath-prepare' && s.elapsed >= 1.1) { s.phase = 'breath'; s.elapsed = 0; }
        else if (s.phase === 'breath' && s.elapsed >= manifest.fireSeconds) { s.phase = 'breath-recover'; s.elapsed = 0; }
        else if (s.phase === 'breath-recover' && s.elapsed >= 1.1) {
          s.phase = 'idle'; s.elapsed = 0; s.wait = 2; s.nextBreath = s.time + between(18, 38);
        }
      }

      const side = s.right ? 'right' : 'left';
      const breathing = s.phase.startsWith('breath');
      const front = held || s.phase === 'exhale' || s.phase === 'center' && s.elapsed / s.duration > .65;
      const walking = ['summon', 'travel', 'settle', 'center'].includes(s.phase);
      const clip: GuardianClip = s.form === 'human' ? 'human' : front ? 'hover' : breathing || walking ? side : 'idle';
      // The idle source faces left; only mirror it after rightward Journey travel.
      const mirrorIdle = clip === 'idle' && command.current.followJourney && s.right;
      const key = s.phase === 'exhale' && exhale.current ? 'exhale'
        : clip === 'idle' && command.current.followJourney ? `idle:${side}` : clip;
      // Advance only through decoded body frames. A cold connection must not chase
      // ever-new pages while the still-loading frame falls further behind the clock.
      const sameClip = key === s.bodyKey || clip === 'idle' && s.bodyKey.split(':')[0] === 'idle';
      const bodySeconds = sameClip ? s.bodySeconds + dt : 0;
      let available = false;
      if (key === 'exhale') { tc.clearRect(0, 0, 640, 600); tc.drawImage(exhale.current!, 32, 0, 576, 432); available = true; }
      else available = drawClip(tc, clip, bodySeconds, mirrorIdle);
      if (available) {
        s.bodySeconds = bodySeconds; s.bodyKey = key; s.bodyFrame = displayedFrame;
        if (key !== poseKey) {
          old.clearRect(0, 0, 640, 600); old.drawImage(pose, 0, 0);
          // Journey switches poses with scroll, so finish the blend promptly.
          // Start from the visible pose even if a reversal interrupts a fade.
          blendSeconds = pathNode && !command.current.entering && ['idle', 'left', 'right'].includes(key.split(':')[0])
            && ['idle', 'left', 'right'].includes(poseKey.split(':')[0]) ? .22 : .9;
          changedAt = poseKey ? s.time : -10; poseKey = key;
        }
        const mix = command.current.moving ? ease(clamp((s.time - changedAt) / blendSeconds, 0, 1)) : 1;
        poseBlend = mix;
        pc.clearRect(0, 0, 640, 600); pc.save();
        // Add contributions to avoid the opacity dip of two source-over fades.
        pc.globalAlpha = 1 - mix; pc.drawImage(previous, 0, 0);
        pc.globalCompositeOperation = 'lighter'; pc.globalAlpha = mix; pc.drawImage(target, 0, 0); pc.restore();
      }
      context.clearRect(0, 0, 640, 600);
      const cloudClip: GuardianClip | null = s.form === 'dragon' && !front && !breathing && !drag.current?.active
        ? pathNode ? 'cloud_drift' : s.phase === 'summon' ? 'cloud_form' : s.phase === 'travel' || s.phase === 'center' ? 'cloud_drift' : s.phase === 'settle' ? 'cloud_dissolve' : null : null;
      if (cloudClip) { drawClip(cc, cloudClip, s.elapsed, s.right, false); context.drawImage(cloud, 0, 0); }
      else cc.clearRect(0, 0, 640, 600);
      context.drawImage(pose, 0, 0);
      // Breathing light stays outside the pixels used for registered body poses.
      const glow = s.form === 'dragon' && s.phase === 'idle' && command.current.moving
        ? .13 + (Math.sin(s.time * Math.PI / 2.4) + 1) * .09 : 0;
      button.style.setProperty('--guardian-gold-glow', String(glow));
      button.style.setProperty('--guardian-crimson-glow', String(glow * .32));
      if (s.time - s.transformAt < 1.8 && command.current.moving) {
        const t = (s.time - s.transformAt) / 1.8, strength = Math.sin(t * Math.PI);
        context.save(); context.globalAlpha = strength * .65;
        for (let i = 0; i < 12; i++) {
          const angle = i * Math.PI / 6 + t * 3, radius = 55 + t * 110;
          const x = 320 + Math.cos(angle) * radius, y = 270 + Math.sin(angle) * radius;
          const mist = context.createRadialGradient(x, y, 0, x, y, 80);
          const gold = i % 3 === 0;
          mist.addColorStop(0, gold ? '#f0c477ad' : i % 3 === 1 ? '#a41b4290' : '#18101dc0');
          mist.addColorStop(1, gold ? '#f0c47700' : '#a41b4200');
          context.fillStyle = mist; context.fillRect(x - 80, y - 80, 160, 160);
          context.beginPath(); context.arc(320, 270, radius, angle - .22, angle + .07);
          context.strokeStyle = gold ? '#ffe3a9' : '#ad2448'; context.lineWidth = gold ? 1.8 : 1.1;
          context.stroke();
        }
        context.restore();
      }
      const left = s.position.x - w.size / 2, top = s.position.y - w.size * .46875;
      button.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${s.scale})`;
      const copy = copyNode?.getBoundingClientRect();
      const overlap = copy ? Math.max(0, Math.min(s.position.x + w.size * .48, copy.right) - Math.max(s.position.x - w.size * .48, copy.left))
        * Math.max(0, Math.min(s.position.y + w.size * .23, copy.bottom) - Math.max(s.position.y - w.size * .47, copy.top)) : 0;
      const desiredOpacity = command.current.entering || command.current.followJourney || drag.current?.active ? 1 : 1 - ease(clamp(overlap / (w.size * w.size * .672) * 4, 0, 1)) * .8;
      s.opacity = command.current.moving ? s.opacity + (desiredOpacity - s.opacity) * (1 - Math.exp(-dt * 5)) : desiredOpacity;
      button.style.opacity = String(s.opacity);
      button.style.pointerEvents = command.current.followJourney || desiredOpacity < .5 ? 'none' : 'auto';
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (fx.canvas.width !== Math.round(w.width * dpr) || fx.canvas.height !== Math.round(w.height * dpr)) {
        fx.canvas.width = Math.round(w.width * dpr); fx.canvas.height = Math.round(w.height * dpr);
      }
      fx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.clearRect(0, 0, w.width, w.height);
      if (s.phase === 'breath' && !held) {
        const fire = cache.sample('fire', s.elapsed) ?? lastFire;
        if (fire) {
          lastFire = fire;
          const { image, spec, sx, sy } = fire, scale = w.size / 640;
          fx.save(); fx.globalAlpha = s.opacity;
          fx.translate(left + 320 * scale, top); if (!s.right) fx.scale(-1, 1);
          fx.drawImage(image, sx, sy, spec.width, spec.height, (ox + spec.left * artScale - 320) * scale,
            (oy + spec.top * artScale) * scale, spec.width * artScale * scale, spec.height * artScale * scale);
          fx.restore();
        }
      } else lastFire = null;
      Object.assign(button.dataset, { phase: held ? 'hover' : s.phase, frame: String(displayedFrame), body: poseKey.split(':')[0], pose: poseKey,
        poseBlend: poseBlend.toFixed(3), blendSeconds: String(blendSeconds),
        form: s.form, direction: side, flight: s.mode, target: `${s.target.x.toFixed(1)},${s.target.y.toFixed(1)}`,
        cloud: cloudClip ?? 'none', guided: String(command.current.followJourney && !command.current.entering), pages: String(cache.count) });
      if (centered) {
        const rect = button.getBoundingClientRect();
        command.current.onCentered?.({ x: rect.left + rect.width * .48, y: rect.top + rect.width * .28 });
      }
      if (command.current.moving && visible) frame = requestAnimationFrame(render);
    };
    const wakeFrame = () => { if (!frame && visible) frame = requestAnimationFrame(render); };
    wake.current = wakeFrame;
    const visibility = () => { visible = intersecting && !document.hidden; cancelAnimationFrame(frame); frame = 0; last = 0; wakeFrame(); };
    const observer = new IntersectionObserver(entries => { intersecting = entries[0].isIntersecting; visibility(); });
    observer.observe(host);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('journey-request', wakeFrame); window.addEventListener('scroll', wakeFrame, { passive: true }); window.addEventListener('resize', wakeFrame, { passive: true });
    wakeFrame();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); wake.current = () => {};
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('journey-request', wakeFrame); window.removeEventListener('scroll', wakeFrame); window.removeEventListener('resize', wakeFrame); };
  }, [moving, ready, entering, sceneKey, followJourney]);

  const greet = () => {
    const s = state.current;
    if (!command.current.entering && !command.current.followJourney && s.form === 'dragon' && !s.phase.startsWith('breath')) {
      greeting.current.until = s.time + 5; wake.current();
    }
  };
  const requestForm = () => {
    if (!command.current.entering && !command.current.followJourney) { transformRequested.current = true; wake.current(); }
  };
  const drop = () => {
    if (drag.current?.active) { state.current.phase = 'idle'; state.current.elapsed = 0; state.current.wait = 4; }
    drag.current = null; wake.current();
  };
  return <div className="sky-roaming-stage" ref={stage}>
    <canvas ref={effects} className="sky-guardian-effects" aria-hidden="true" />
    <button ref={companion} className="sky-realm-guardian" aria-label={followJourney ? 'Heavenly demonic dragon guiding the journey' : 'Heavenly demonic dragon: greet, drag, or double-click to transform'}
      title={followJourney ? undefined : 'Greet for five seconds · Drag to move · Double-click to transform'} disabled={entering || followJourney} tabIndex={followJourney ? -1 : undefined}
      onPointerEnter={event => { if (event.pointerType !== 'touch' && !greeting.current.pointer) { greeting.current.pointer = true; greet(); } }}
      onPointerLeave={() => { greeting.current.pointer = false; }}
      onPointerDown={event => {
        if (event.pointerType === 'touch') greet();
        if (command.current.followJourney || event.button !== 0) return;
        drag.current = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: { ...state.current.position }, active: false };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const d = drag.current; if (!d || d.id !== event.pointerId) return;
        const dx = event.clientX - d.start.x, dy = event.clientY - d.start.y;
        if (Math.hypot(dx, dy) > 6) d.active = true;
        if (d.active) {
          greeting.current.until = 0; const w = world.current;
          state.current.position = contain({ x: d.origin.x + dx, y: d.origin.y + dy }, roamBounds(w.width, w.height, w.size));
          state.current.phase = 'idle'; state.current.elapsed = 0; wake.current();
        }
      }}
      onPointerUp={drop} onPointerCancel={drop} onLostPointerCapture={drop} onDoubleClick={requestForm}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); requestForm(); } }}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible') && !greeting.current.focus) { greeting.current.focus = true; greet(); } }}
      onBlur={() => { greeting.current.focus = false; }}>
      <img className={`sky-guardian-poster ${ready ? 'sky-guardian-loaded' : ''}`} src={guardianBase + profile + '/poster.webp'} alt="" draggable={false} />
      <canvas ref={canvas} width={640} height={600} className={ready ? 'sky-guardian-loaded' : ''} aria-hidden="true" />
    </button>
  </div>;
}
