// Adapted from 21st.dev: ibelick/animated-background and preetsuthar17/spotlight-card.
// Source links and local accessibility changes are documented in scripts/21st-sources.md.
import { useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export function AnimatedNavigation({ items, onNavigate, currentId, moving = true }: { currentId?: string; moving?: boolean; items: { id: string; label: string }[]; onNavigate?: (id: string) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const id = useId();
  const reducedPreference = useReducedMotion();
  const reduced = reducedPreference || !moving;
  return <nav aria-label="Portfolio sections" onMouseLeave={() => setActive(null)}>
    {items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={currentId === item.id ? "page" : undefined} onClick={event => { if (onNavigate) { event.preventDefault(); onNavigate(item.id); } }} onMouseEnter={() => setActive(item.id)} onFocus={() => setActive(item.id)} onBlur={() => setActive(null)}>
      <AnimatePresence initial={false}>{active === item.id && <motion.span aria-hidden="true" className="ember-nav-light" layoutId={`nav-${id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { type: 'spring', bounce: .15, duration: .4 }} />}</AnimatePresence>
      <span>{item.label}</span>
    </a>)}
  </nav>;
}

export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  return <div ref={ref} className={`ember-spotlight ${className}`} onPointerMove={event => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect && event.pointerType !== 'touch') setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }} onPointerEnter={() => setOpacity(.55)} onPointerLeave={() => setOpacity(0)} onFocus={() => {
    setPosition({ x: (ref.current?.clientWidth ?? 0) / 2, y: (ref.current?.clientHeight ?? 0) / 2 }); setOpacity(.4);
  }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpacity(0); }}>
    <div className="ember-card-light" aria-hidden="true" style={{ opacity, background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, #ddaf5550, transparent 80%)` }} />
    {children}
  </div>;
}
