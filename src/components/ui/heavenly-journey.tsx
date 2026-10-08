import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { skyJourney } from '../../data/skygarden';
import { journeyGeometry } from './journey-path';
import '../../journey-contact.css';

type Props = { moving: boolean; navigate: (page: string) => void };

/** The supplied alternating, horizontally scrubbed timeline, reimagined as a cloud bridge. */
export function HeavenlyJourney({ moving, navigate }: Props) {
  const section = useRef<HTMLElement>(null);
  const panorama = useRef<HTMLDivElement>(null);
  const bridge = useRef<HTMLDivElement>(null);
  const chapters = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const contact = useRef({ chapter: 0, direction: 1 as 1 | -1 });
  const [chapter, setChapter] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const renderPath = useCallback((value: number) => {
    if (value !== progress.current) contact.current.direction = value > progress.current ? 1 : -1;
    progress.current = value;
    const node = panorama.current;
    if (!node) return;
    const guardian = node.closest('.sky-app')?.querySelector<HTMLElement>('.sky-realm-guardian');
    const geometry = journeyGeometry(value, node.clientWidth, skyJourney.length,
      { ...contact.current, guardianWidth: guardian?.offsetWidth || undefined });
    contact.current.chapter = geometry.chapter;
    node.style.setProperty('--chapter-step', `${geometry.step}px`);
    node.style.setProperty('--track-width', `${geometry.trackWidth}px`);
    if (bridge.current) bridge.current.style.transform = `translate3d(${geometry.offset}px,0,0)`;
    if (chapters.current) chapters.current.style.transform = `translate3d(${geometry.offset}px,0,0)`;
    if (marker.current) {
      marker.current.style.left = `${geometry.guardianAnchor}px`;
      marker.current.dataset.progress = String(value);
      marker.current.dataset.direction = contact.current.direction === 1 ? 'right' : 'left';
    }
    setChapter(geometry.chapter);
  }, []);
  const requestPath = useCallback((value: number) => {
    if (marker.current) marker.current.dataset.requested = String(value);
    renderPath(value);
    window.dispatchEvent(new Event('journey-request'));
  }, [renderPath]);
  useMotionValueEvent(scrollYProgress, 'change', requestPath);
  useEffect(() => {
    const node = panorama.current;
    if (!node) return;
    const observer = new ResizeObserver(() => renderPath(progress.current));
    observer.observe(node);
    renderPath(scrollYProgress.get());
    if (marker.current) marker.current.dataset.requested = String(scrollYProgress.get());
    window.dispatchEvent(new Event('journey-request'));
    return () => observer.disconnect();
  }, [renderPath, scrollYProgress]);
  useEffect(() => {
    const nav = navigation.current;
    const selected = nav?.children[chapter] as HTMLElement | undefined;
    if (nav && selected) nav.scrollTo({ left: selected.offsetLeft - nav.clientWidth / 2 + selected.clientWidth / 2, behavior: moving ? 'smooth' : 'instant' });
  }, [chapter, moving]);
  const selectChapter = (index: number) => {
    if (!section.current) return;
    const top = section.current.getBoundingClientRect().top + window.scrollY;
    const distance = section.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + index / (skyJourney.length - 1) * distance, behavior: moving ? 'smooth' : 'instant' });
  };
  return <section ref={section} className="heavenly-journey" id="journey" aria-label="My journey through education and AI engineering">
    <div className="journey-viewport">
      <img className="journey-scenery" src="/assets/skygarden/heavenly-demonic-sky.webp" alt="" />
      <div className="journey-scene-veil" />
      <div className="journey-heading">
        <div><p className="realm-eyebrow">03 / THE JOURNEY</p><h1 data-view-heading tabIndex={-1}>A path made of <em>questions.</em></h1></div>
        <p>From circuits to intelligence.<br />Every chapter opened the next.</p>
      </div>
      <div ref={panorama} className="journey-panorama">
        <div ref={bridge} className="journey-bridge-track" aria-hidden="true" />
        <div ref={marker} className="journey-path-marker" data-guardian-path data-progress="0" data-requested="0" data-phase="idle" aria-hidden="true" />
        <div ref={chapters} className="journey-chapter-track">
          {skyJourney.map((item, index) => <article key={item.place} className={`journey-chapter ${index % 2 ? 'journey-chapter-below' : 'journey-chapter-above'} ${chapter === index ? 'is-current' : ''}`} style={{ left: `calc(var(--chapter-step) * ${index})` }} aria-current={chapter === index ? 'step' : undefined}>
            <span className="journey-stem" aria-hidden="true" />
            <div className="journey-chapter-copy">
              <div className="journey-chapter-label"><span>{String(index + 1).padStart(2, '0')} / {item.place}</span><time>{item.date}</time></div>
              <h2>{item.title}</h2><p>{item.story}</p><small>{item.context}</small>
            </div>
          </article>)}
        </div>
      </div>
      <div className="journey-controls">
        <div className="journey-progress-caption"><span>{String(chapter + 1).padStart(2, '0')} / 07</span><span><ArrowDown size={13} /> Scroll to cross the bridge</span></div>
        <nav ref={navigation} className="journey-chapter-nav" aria-label="Jump to a journey chapter">{skyJourney.map((item, index) => <button key={item.place} onClick={() => selectChapter(index)} aria-label={`Chapter ${index + 1}: ${item.place}`} aria-current={chapter === index ? 'step' : undefined}>{item.short}</button>)}</nav>
        <div className="journey-page-links"><button onClick={() => navigate('work')}><ArrowLeft size={14} /> Work</button><button onClick={() => navigate('contact')}>Let’s connect <ArrowRight size={14} /></button></div>
      </div>
    </div>
  </section>;
}
