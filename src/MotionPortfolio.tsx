import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDown, ArrowRight, Download, Github, Mail, Pause, Play, Sparkles, FileSearch, ShieldCheck, Check, Brain, Search, Code2, FlaskConical, Briefcase, Megaphone, ClipboardList, Eye, X } from 'lucide-react';
import { AnimatedNavigation, SpotlightCard } from './components/ui/catalog-motion';
import './motion-portfolio.css';

const specialists = [
  { name: 'Manager', icon: Briefcase, task: 'Keeps the work moving and checks dependencies.' },
  { name: 'Planner', icon: ClipboardList, task: 'Turns a brief into ordered, explicit tasks.' },
  { name: 'Researcher', icon: Search, task: 'Collects evidence to inform the next step.' },
  { name: 'Product', icon: Brain, task: 'Defines the user problem and acceptance criteria.' },
  { name: 'Marketing', icon: Megaphone, task: 'Shapes the message around the intended audience.' },
  { name: 'Developer', icon: Code2, task: 'Builds an implementation from the agreed plan.' },
  { name: 'Tester', icon: FlaskConical, task: 'Checks behavior against the acceptance criteria.' },
  { name: 'Reviewer', icon: Eye, task: 'Reviews the result before it moves forward.' },
];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65 }}>{children}</motion.div>;
}

function SafetyDemo({ moving }: { moving: boolean }) {
  const [stage, setStage] = useState(-1);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useReducedMotion();
  const stages = ['Retrieve', 'Rerank', 'Ground', 'Validate'];
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { if ((!moving || reduced) && running) { if (timer.current) clearInterval(timer.current); setStage(3); setRunning(false); } }, [moving, reduced, running]);
  const run = () => {
    if (!moving || reduced) { setStage(3); return; }
    setStage(0); setRunning(true); let next = 0;
    timer.current = setInterval(() => { next++; setStage(next); if (next === 3) { clearInterval(timer.current!); setRunning(false); } }, 650);
  };
  return <div className="ember-safety-demo">
    <div className="ember-demo-bar"><span><ShieldCheck size={15} /> SAFETY COMPLIANCE AGENT</span><small>Workflow preview</small></div>
    <div className="ember-query"><FileSearch size={20} /><p>What evidence supports this answer?</p><button onClick={run} disabled={running} aria-label="Run workflow preview">{running ? <span className="ember-spinner" /> : <ArrowRight size={17} />}</button></div>
    <div className="ember-stages">{stages.map((name, i) => <div key={name} className={stage >= i ? 'is-done' : ''}><span>{stage > i || stage === 3 ? <Check size={12} /> : `0${i + 1}`}</span>{name}</div>)}</div>
    <div className="ember-result" aria-live="polite">{stage === 3 ? <><ShieldCheck size={20} /><div><strong>Evidence before an answer.</strong><p>Document, page and section citations are checked before a response is returned.</p></div></> : <><div className="ember-source-lines"><i /><i /><i /></div><p>{running ? `${stages[Math.max(stage, 0)]} · tracing the evidence…` : 'Run the preview to explore the pipeline.'}</p></>}</div>
  </div>;
}

function AgentDemo() {
  const [selected, setSelected] = useState(0);
  const Icon = specialists[selected].icon;
  return <div className="ember-agent-demo">
    <div className="ember-demo-bar"><span><Sparkles size={15} /> AGENTFORGE</span><small>Office concept</small></div>
    <div className="ember-office">{specialists.map((agent, i) => <button key={agent.name} onClick={() => setSelected(i)} aria-pressed={selected === i} className={selected === i ? 'is-selected' : ''}><span className="ember-desk"><agent.icon size={20} strokeWidth={1.4} /><i /></span><span>{agent.name}</span></button>)}</div>
    <div className="ember-agent-inspector" aria-live="polite"><Icon size={19} /><div><strong>{specialists[selected].name}</strong><p>{specialists[selected].task}</p></div><span className="ember-agent-status">Selected</span></div>
  </div>;
}

function Dragon({ moving }: { moving: boolean }) {
  const reduced = useReducedMotion();
  const [perch, setPerch] = useState({ x: 0, y: 0, rotate: 0 });
  useEffect(() => {
    if (!moving || reduced) { setPerch({ x: 0, y: 0, rotate: 0 }); return; }
    const timer = setInterval(() => setPerch({ x: Math.random() * 44 - 22, y: Math.random() * 30 - 15, rotate: Math.random() * 3 - 1.5 }), 4800);
    return () => clearInterval(timer);
  }, [moving, reduced]);
  return <div className="ember-dragon-stage"><div className="ember-dragon-halo" /><motion.img className="ember-dragon" src="/assets/obsidian-dragon.png" alt="Black and gold dragon with an ivory mane and branching horns" animate={perch} transition={{ duration: moving && !reduced ? 3.8 : 0, ease: 'easeInOut' }} /><span className="ember-dragon-caption"><span /> A LITTLE CURIOSITY. A LITTLE FIRE.</span></div>;
}

export default function MotionPortfolio() {
  const reduced = useReducedMotion();
  const [moving, setMoving] = useState(true);
  const [layout, setLayout] = useState<'gallery' | 'index'>('gallery');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [edge, setEdge] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(scrollYProgress, [0, .5], [0, -45]);
  const animated = moving && !reduced;
  useEffect(() => { document.title = 'Ember Lab · Jashwanth Reddy · Motion Preview'; }, []);
  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => setEdge(current => (current + 1 + Math.floor(Math.random() * 2)) % 3), 9000);
    return () => clearInterval(timer);
  }, [animated]);
  return <MotionConfig reducedMotion={animated ? 'user' : 'always'}><div className={`ember ${animated ? '' : 'ember-resting'}`}>
    <a className="ember-skip" href="#ember-main">Skip to content</a>
    <motion.div className="ember-progress" style={{ scaleX: animated ? scaleX : scrollYProgress }} />
    <header className="ember-header ember-shell"><a className="ember-brand" href="#top">JR<span>✦</span></a><AnimatedNavigation items={[{ id: 'work', label: 'Work' }, { id: 'journey', label: 'Journey' }, { id: 'contact', label: 'Contact' }]} /><button className="ember-motion-toggle" onClick={() => setMoving(!moving)} aria-pressed={!moving} aria-label={moving ? 'Pause motion' : 'Resume motion'}>{moving && !reduced ? <Pause size={13} /> : <Play size={13} />}<span>{moving && !reduced ? 'Motion on' : 'Motion resting'}</span></button></header>
    <main id="ember-main">
      <section className="ember-hero ember-shell" id="top"><motion.div className="ember-hero-copy" style={{ y: animated ? heroY : 0 }}><Reveal><div className="ember-kicker"><span className="ember-live-dot" /> AI ENGINEER · MELBOURNE</div><h1>AI systems.<br /><em>Built to work.</em></h1><p>I’m Jashwanth. My work started with helping machines see. Now I’m building agents that can reason, check their work, and take the next step.</p><div className="ember-actions"><a className="ember-button ember-primary" href="#work">Explore the work <ArrowUpRight size={17} /></a><a className="ember-resume" href="/resume.pdf" download>Resume <Download size={15} /></a></div><div className="ember-hero-note"><span>Currently</span> Master of AI at Monash University</div></Reveal></motion.div><Dragon moving={animated} /><a className="ember-scroll-note" href="#work"><ArrowDown size={14} /> SCROLL TO EXPLORE</a></section>
      <div className="ember-credentials ember-shell"><span><strong>Computer vision</strong>Production experience at Fotos</span><span><strong>Agentic systems</strong>LangGraph · RAG · FastAPI</span><span><strong>Always building</strong>From experiments to working systems</span></div>
      <section className="ember-work ember-shell" id="work"><Reveal><div className="ember-section-heading"><div><div className="ember-kicker">01 / SELECTED WORK</div><h2>Curiosity, put to work.</h2></div><div className="ember-layout-toggle" aria-label="Project arrangement">{(['gallery', 'index'] as const).map(view => <button key={view} aria-pressed={layout === view} onClick={() => setLayout(view)}>{view === 'gallery' ? 'Gallery' : 'Index'}</button>)}</div></div></Reveal>
        <div className={`ember-projects ${layout === 'index' ? 'ember-index' : ''}`}>
          <Reveal><SpotlightCard><SafetyDemo moving={animated} /><div className="ember-project-copy"><div className="ember-project-meta"><span>01 / RELIABLE AGENTS</span><span className="ember-status">Backend built</span></div><h3>Australian Safety<br />Compliance Agent</h3><p>A workplace safety question is only useful when the answer can point back to its evidence. This agent retrieves, ranks and checks that evidence before responding.</p><div className="ember-tags"><span>LangGraph</span><span>Hybrid RAG</span><span>FastAPI</span></div><button className="ember-text-button" aria-expanded={expanded === 'safety'} onClick={() => setExpanded(expanded === 'safety' ? null : 'safety')}>Inside the system {expanded === 'safety' ? <X size={16} /> : <ArrowUpRight size={16} />}</button>{expanded === 'safety' && <div className="ember-project-detail"><p>Vector + BM25 retrieval, cross-encoder reranking, and deterministic citation validation. Groundedness checks can trigger a bounded retry.</p><small>The interface above illustrates the backend workflow; it is not a live safety advice service.</small></div>}</div></SpotlightCard></Reveal>
          <Reveal><SpotlightCard><AgentDemo /><div className="ember-project-copy"><div className="ember-project-meta"><span>02 / COLLABORATIVE AI</span><span className="ember-status ember-planned">In development</span></div><h3>AgentForge.<br />A team, in motion.</h3><p>One prompt. Several specialists. An agent workspace designed to make planning, handoffs and review visible, instead of hiding them behind a chat window.</p><div className="ember-tags"><span>Multi-agent</span><span>LangGraph</span><span>Structured tasks</span></div><button className="ember-text-button" aria-expanded={expanded === 'forge'} onClick={() => setExpanded(expanded === 'forge' ? null : 'forge')}>Explore the idea {expanded === 'forge' ? <X size={16} /> : <ArrowUpRight size={16} />}</button>{expanded === 'forge' && <div className="ember-project-detail"><p>A planned team of eight agents works through task dependencies, structured artifacts and review. Select a specialist above to explore its role.</p><small>The office is an interactive design concept. The full system is still being built.</small></div>}</div></SpotlightCard></Reveal>
        </div><a className="ember-archive-link" href="/projects">Earlier experiments in vision, language and ML <ArrowUpRight size={15} /></a>
      </section>
      <section className="ember-journey ember-shell" id="journey"><Reveal><div className="ember-kicker">02 / THE THREAD</div><div className="ember-journey-grid"><h2>Seeing patterns.<br /><em>Building possibilities.</em></h2><div><p>Computer vision taught me to turn noisy inputs into useful signals. At Fotos, that meant face analysis, photo culling and neural color transfer. Agent systems ask the next question: once a machine understands something, how does it act reliably?</p><p>That’s the thread I’m following through my Master of AI at Monash and the systems I’m building now.</p><a className="ember-text-button" href="/journey">Experience & education <ArrowUpRight size={16} /></a></div></div></Reveal><div className="ember-toolkit">{['Python', 'PyTorch', 'LangGraph', 'OpenCV', 'FastAPI', 'PostgreSQL', 'GCP', 'Docker'].map(tool => <span key={tool}>{tool}</span>)}</div></section>
      <section className="ember-contact ember-shell" id="contact"><Reveal><div className="ember-kicker">03 / WHAT’S NEXT</div><h2>Let’s build something<br /><em>worth the curiosity.</em></h2><a className="ember-button ember-primary" href="mailto:jashwanthreddysungjin@gmail.com">Start a conversation <ArrowUpRight size={17} /></a></Reveal><div className="ember-contact-mark" aria-hidden="true">JR<span>✦</span></div></section>
    </main>
    <footer className="ember-footer ember-shell"><span>Jashwanth Reddy · {new Date().getFullYear()}</span><span className="ember-preview-tag">EMBER LAB / DESIGN PREVIEW</span><div><a href="https://github.com/NaReddyJashwanthReddy" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={17} /></a><a href="mailto:jashwanthreddysungjin@gmail.com" aria-label="Email"><Mail size={17} /></a></div></footer>
    <motion.div className="ember-roamer" aria-hidden="true" animate={{ y: animated ? [0, -170, -340][edge] : 0, scaleX: edge === 1 ? -1 : 1 }} transition={{ y: { duration: animated ? 4 : 0, ease: 'easeInOut' }, scaleX: { duration: animated ? .4 : 0 } }}><img src="/assets/obsidian-dragon.png" alt="" /></motion.div>
  </div></MotionConfig>;
}
