import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { ArrowRight, Download, Pause, Play, RotateCcw, Upload, X } from 'lucide-react';
import { AnimatedNavigation } from './components/ui/catalog-motion';
import { HeavenlyJourney } from './components/ui/heavenly-journey';
import { HeavenlyContact } from './components/ui/heavenly-contact';
import type { DragonModelInfo } from './components/ui/dragon-rig';
import { RealmGuardian } from './components/ui/realm-guardian';
import { DragonSmokeTransition } from './components/ui/dragon-smoke-transition';
import type { Point } from './components/ui/guardian-routes';
import './skygarden.css';
import './heavenly-realm.css';
import { WorkRealm } from './components/ui/work-realm';
import { parseRoute, routeHash, type WorkRoute } from './data/work-catalog';

const DragonRig = lazy(() => import('./components/ui/dragon-rig'));
const assets = '/assets/skygarden/';


export default function SkygardenPortfolio() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const moving = !paused && !reduced;
  const [view, setView] = useState<WorkRoute>(() => parseRoute(location.hash));
  const inside = view.page !== 'home';
  const [transitioning, setTransitioning] = useState(false);
  const [smokeStage, setSmokeStage] = useState<'gather' | 'breath' | 'reveal'>('gather');
  const breathStarted = useRef(false);
  const entranceFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notes, setNotes] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<DragonModelInfo | null>(null);
  const [modelError, setModelError] = useState('');
  const [clip, setClip] = useState('');
  const entrance = useRef<HTMLButtonElement>(null);
  const notesPanel = useRef<HTMLDivElement>(null);
  const pending = useRef<WorkRoute>({ page: 'work' });
  const writeHistory = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const objectUrl = useRef<string | null>(null);
  const [smokeOrigin, setSmokeOrigin] = useState<Point>({ x: 0, y: 0 });
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const sceneX = useSpring(pointerX, { stiffness: 35, damping: 20 });
  const sceneY = useSpring(pointerY, { stiffness: 35, damping: 20 });
  const onReady = useCallback((info: DragonModelInfo) => { setModelInfo(info); setModelError(''); }, []);
  const onError = useCallback((message: string) => { setModelError(message); setModelInfo(null); }, []);
  useEffect(() => {
    document.title = 'Heavenly Realm · Jashwanth Reddy';

    return () => { timers.current.forEach(clearTimeout); if (entranceFallback.current) clearTimeout(entranceFallback.current); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); };
  }, []);
  useEffect(() => {
    if (!moving) { pointerX.set(0); pointerY.set(0); return; }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const x = event.clientX / window.innerWidth * 2 - 1, y = event.clientY / window.innerHeight * 2 - 1;
      pointerX.set(x * -7); pointerY.set(y * -5);
    };
    const leave = () => { pointerX.set(0); pointerY.set(0); };
    window.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', leave);
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); };
  }, [moving, pointerX, pointerY]);
  useEffect(() => {
    if (!notes) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    notesPanel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, [notes]);
  const commitView = useCallback(() => {
    const target = pending.current;
    setView(target);
    if (writeHistory.current) history.pushState(null, '', location.pathname + location.search + routeHash(target));
    window.scrollTo({ top: 0, behavior: 'instant' });

  }, []);
  const beginSmoke = useCallback((mouth: Point) => {
    if (breathStarted.current) return;
    breathStarted.current = true;
    if (entranceFallback.current) clearTimeout(entranceFallback.current);
    setSmokeOrigin(mouth); setSmokeStage('breath');
  }, []);
  const navigate = useCallback((destination: string | WorkRoute, updateHistory = true) => {
    if (transitioning) return;
    const target = typeof destination === 'string' ? parseRoute('#' + destination) : destination;
    if (routeHash(target) === routeHash(view)) return;
    pending.current = target; writeHistory.current = updateHistory;
    if (!moving) { commitView(); return; }
    breathStarted.current = false; setSmokeStage('gather'); setTransitioning(true);
    entranceFallback.current = setTimeout(() => beginSmoke({ x: innerWidth / 2, y: innerHeight * .42 }), 6500);
  }, [transitioning, view, moving, commitView, beginSmoke]);
  useEffect(() => {
    const back = () => navigate(parseRoute(location.hash), false);
    window.addEventListener('popstate', back);
    window.addEventListener('hashchange', back);
    return () => { window.removeEventListener('popstate', back); window.removeEventListener('hashchange', back); };
  }, [navigate]);
  const smokeCovered = () => { commitView(); setSmokeStage('reveal'); };
  useEffect(() => {
    if (!transitioning || moving) return;
    if (entranceFallback.current) clearTimeout(entranceFallback.current);
    commitView(); setTransitioning(false);
  }, [moving, transitioning, commitView]);
  useEffect(() => {
    if (transitioning) return;
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-view-heading], #sky-main h1, #sky-main h2')?.focus({ preventScroll: true }));
    document.title = `${view.page === 'home' ? 'Heavenly Realm' : view.page === 'work' ? 'Work Archive' : view.page === 'journey' ? 'Journey' : 'Contact'}  /  Jashwanth Reddy`;
    return () => cancelAnimationFrame(frame);
  }, [view, transitioning]);
  const goHome = () => navigate({ page: 'home' });
  const loadModel = (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.glb')) { setModelError('Choose a GLB file with embedded textures.'); return; }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file); setModelInfo(null); setModelError(''); setClip(''); setModelUrl(objectUrl.current);
  };
  return <div className={`sky-app ${moving ? '' : 'sky-resting'} ${inside ? 'sky-inside' : ''} ${view.page === 'journey' ? 'sky-journey-active' : ''} ${transitioning ? 'sky-entering' : ''}`}>
    <a className="sky-skip" href="#sky-main" onClick={event => { event.preventDefault(); document.getElementById("sky-main")?.focus(); }}>Skip to content</a>
    <header className={`sky-header ${inside ? 'sky-header-dark' : ''}`}><button className="sky-brand" onClick={goHome} aria-label="Jashwanth Reddy home"><img src={`${assets}signature-transparent.png`} alt="Gold dragon signature" /><span>Jashwanth.</span></button><AnimatedNavigation currentId={view.page} moving={moving} items={[{ id: 'work', label: 'Work' }, { id: 'journey', label: 'Journey' }, { id: 'contact', label: 'Contact' }]} onNavigate={navigate} /><button className="sky-motion-button" aria-label={moving ? 'Pause motion' : 'Resume motion'} aria-pressed={!moving} onClick={() => setPaused(!paused)}>{moving ? <Pause size={16} /> : <Play size={16} />}</button></header>
    <main id="sky-main" tabIndex={-1} aria-busy={transitioning} inert={transitioning}>
      {!inside && <section className="sky-garden sky-heavenly-realm" aria-label="Heavenly realm landing scene"><motion.img className="sky-scene-image sky-garden-background" src={`${assets}heavenly-sky-v2.webp`} alt="Golden palaces on floating islands above an open sea of sunrise clouds and waterfalls" style={{ x: sceneX, y: sceneY }} fetchPriority="high" />
        <div className="sky-realm-light" aria-hidden="true" />
        <div className="sky-realm-mist sky-realm-mist-near" aria-hidden="true" />
        <div className="sky-realm-mist sky-realm-mist-far" aria-hidden="true" />
        <div className="sky-realm-motes" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} style={{ left: `${12 + i * 9}%`, top: `${30 + (i * 17) % 58}%`, animationDelay: `${-i * 2.7}s` }} />)}</div>
        <motion.div className="sky-garden-copy" initial={{ opacity: 0, y: moving ? 18 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: moving ? 1.1 : 0, ease: [.22, 1, .36, 1] }}>
          <p className="sky-eyebrow"><span className="sky-realm-dot" /> AI ENGINEER · MELBOURNE</p>
          <h1 tabIndex={-1}>A little world.<br /><em>A lot of curiosity.</em></h1>
          <p className="sky-intro-name">I’m Jashwanth Reddy.</p><p className="sky-intro">I turn questions into AI systems.<br />Welcome to my corner of the clouds.</p>
          <div className="sky-actions"><button ref={entrance} className="sky-button sky-primary" onClick={() => navigate('work')} disabled={transitioning}>Explore my work <ArrowRight size={18} /></button><a className="sky-realm-resume" href="/resume.pdf" download>Resume <Download size={16} /></a></div>
        </motion.div>
        <div className="sky-realm-footer"><span>01 / THE HEAVENLY REALM</span><span className="sky-guardian-hint">A guardian with a mind of its own.</span><button disabled={transitioning} onClick={() => navigate('work')}>Discover what’s beyond <ArrowRight size={15} /></button></div>
      </section>}
      {view.page === 'work' && <WorkRealm key={view.category ?? 'work'} route={view} moving={moving} navigate={navigate} />}
      {view.page === 'journey' && <HeavenlyJourney moving={moving} navigate={navigate} />}
      {view.page === 'contact' && <HeavenlyContact moving={moving} navigate={navigate} onNotes={() => setNotes(true)} />}
    </main>
    <div className="sky-guardian-world"><RealmGuardian moving={moving} followJourney={view.page === 'journey'} entering={transitioning} sceneKey={routeHash(view)} onCentered={beginSmoke} /></div>
    {transitioning && smokeStage !== 'gather' && <DragonSmokeTransition origin={smokeOrigin} reveal={smokeStage === 'reveal'} onCovered={smokeCovered} onFinished={() => setTransitioning(false)} />}
    <AnimatePresence>{notes && <motion.div className="sky-notes-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotes(false)}><div ref={notesPanel} className="sky-notes" role="dialog" aria-modal="true" aria-labelledby="sky-notes-title" onClick={event => event.stopPropagation()} onKeyDown={event => {
      if (event.key === 'Escape') setNotes(false);
      if (event.key === 'Tab') {
        const items = notesPanel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}><button className="sky-close" onClick={() => setNotes(false)} aria-label="Close preview notes" autoFocus><X size={22} /></button><p className="sky-eyebrow">DESIGN PREVIEW</p><h2 id="sky-notes-title">A world in the making.</h2><p>The heavenly realm has a roaming guardian: it breathes at rest, summons clouds to travel, and turns toward visitors who greet it. To enter the portfolio, the dragon comes to the center and breathes black smoke across the screen, revealing the work archive and the journey beyond.</p>{modelUrl && !modelError && <Suspense fallback={null}><DragonRig url={modelUrl} moving={moving} clip={clip} onReady={onReady} onError={onError} /></Suspense>}<label className="sky-model-upload"><Upload size={18} /> Load a dragon GLB<input type="file" accept=".glb,model/gltf-binary" onChange={event => { loadModel(event.target.files?.[0]); event.target.value = ''; }} /></label><p className="sky-fine-print">The file stays on this device. Use a GLB with embedded textures; animations and head-bone tracking depend on the supplied rig.</p><div role="status" className="sky-model-status">{modelError || (modelInfo ? `${modelInfo.bones} bones · ${modelInfo.animations.length} animation clips · ${modelInfo.head ? 'head tracking available' : 'no named head found'}` : modelUrl ? 'Loading model…' : 'No 3D model connected yet.')}</div>{modelInfo && modelInfo.animations.length > 0 && <label className="sky-clip-select">Animation<select value={clip || modelInfo.animations.find(name => /idle|breath|rest/i.test(name)) || modelInfo.animations[0]} onChange={event => setClip(event.target.value)}>{modelInfo.animations.map(name => <option key={name}>{name}</option>)}</select></label>}{modelUrl && <button className="sky-text-link" onClick={() => { setModelUrl(null); setModelInfo(null); setModelError(''); if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null; } }}>Return to artwork <RotateCcw size={16} /></button>}<button className="sky-button sky-primary" onClick={() => setNotes(false)}>Explore the preview <ArrowRight size={17} /></button></div></motion.div>}</AnimatePresence>
  </div>;
}

