import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check, Copy, Download, Github, Info, Mail } from 'lucide-react';
import '../../journey-contact.css';

const email = 'jashwanthreddysungjin@gmail.com';
type Props = { moving: boolean; navigate: (page: string) => void; onNotes: () => void };

export function HeavenlyContact({ moving, navigate, onNotes }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copyEmail = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
      timer.current = setTimeout(() => setCopyState('idle'), 3500);
    } catch { setCopyState('manual'); }
  };
  return <section className="heavenly-contact" id="contact">
    <img className="contact-scenery" src="/assets/journey/contact-observatory.webp" alt="A quiet golden observatory and writing desk above the clouds" />
    <div className="contact-scene-veil" />
    <motion.div className="contact-content" data-guardian-copy initial={{ opacity: 0, y: moving ? 18 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: moving ? .75 : 0 }}>
      <p className="realm-eyebrow">04 / THE NEXT CHAPTER</p>
      <h1 data-view-heading tabIndex={-1}>Good things begin<br />with a <em>conversation.</em></h1>
      <p className="contact-intro">A question, an idea, a team looking to build.<br />I’d love to hear what you have in mind.</p>
      <p className="contact-context">AI engineering · Research · Collaboration<br /><span>Based in Melbourne, connected beyond it.</span></p>
      <div className="contact-email-block"><span className="contact-small-label">WRITE TO ME</span><a className="contact-email" href={`mailto:${email}`}>{email}<ArrowUpRight size={18} /></a>
        <div className="contact-email-actions"><a className="contact-primary" href={`mailto:${email}?subject=Let%E2%80%99s%20build%20something`}>Start a conversation <Mail size={16} /></a><button className="contact-copy" onClick={copyEmail}>{copyState === 'copied' ? <Check size={15} /> : <Copy size={15} />}{copyState === 'copied' ? 'Copied' : 'Copy email'}</button></div>
        <span className="contact-copy-status" role="status">{copyState === 'manual' ? 'Select the email address above to copy it.' : copyState === 'copied' ? 'Email copied to clipboard.' : ''}</span>
      </div>
      <div className="contact-links"><a href="https://github.com/NaReddyJashwanthReddy" target="_blank" rel="noreferrer"><Github size={16} /> GitHub <ArrowUpRight size={13} /></a><a href="https://www.kaggle.com/jashwanthreddy0264" target="_blank" rel="noreferrer">Kaggle <ArrowUpRight size={13} /></a><a href="/resume.pdf" download>Resume <Download size={15} /></a></div>
    </motion.div>
    <div className="contact-scene-caption" aria-hidden="true"><span>A LITTLE WORLD, STILL GROWING.</span><p>See you beyond the clouds.</p></div>
    <footer className="contact-footer"><button onClick={() => navigate('journey')}><ArrowLeft size={14} /> Back to the journey</button><span>Jashwanth Reddy · {new Date().getFullYear()}</span><button onClick={onNotes}><Info size={14} /> About this world</button></footer>
  </section>;
}
