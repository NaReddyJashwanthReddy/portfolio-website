import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Compass, Layers } from 'lucide-react';
import DiscCascadeCarousel from './disc-cascade-carousel';
import { workCategories, type WorkRoute } from '../../data/work-catalog';
import '../../work-realm.css';

const artwork = (art: string) => `/assets/work/${art}.webp`;
export function WorkRealm({ route, moving, navigate }: { route: WorkRoute; moving: boolean; navigate: (route: WorkRoute) => void }) {
  const category = workCategories.find(item => item.id === route.category);
  const project = category?.projects.find(item => item.id === route.project);
  const [categoryIndex, setCategoryIndex] = useState(category ? workCategories.indexOf(category) : 0);
  const [projectIndex, setProjectIndex] = useState(0);
  const selectedCategory = category ?? workCategories[categoryIndex];
  const selectedProject = selectedCategory.projects[projectIndex] ?? selectedCategory.projects[0];
  const activeTitle = category ? selectedProject.title : selectedCategory.title;
  const open = () => navigate(category ? { page: 'work', category: category.id, project: selectedProject.id } : { page: 'work', category: selectedCategory.id });
  const items = category ? category.projects.map((item, index) => ({ title: item.title, src: artwork(category.art), label: item.title, fine: `${String(index + 1).padStart(2, '0')} / ${item.status}`, alt: '' })) : workCategories.map((item, index) => ({ title: item.title, src: artwork(item.art), label: item.short, fine: `${String(index + 1).padStart(2, '0')} / ${item.projects.length} entries`, alt: '' }));
  return <section className={`work-realm ${category ? 'work-collection' : ''} ${project ? 'work-profile' : ''}`} aria-label="Work archive">
    <img className="work-world" src="/assets/skygarden/heavenly-sky-v2.webp" alt="" />
    <div className="work-world-shade" />
    <div className="work-border" aria-hidden="true" />
    <nav className="work-breadcrumb" aria-label="Work breadcrumb">
      <button onClick={() => navigate({ page: category ? 'work' : 'home' })}><ArrowLeft size={15} />{category ? 'All collections' : 'The garden'}</button>
      {category && <><span>/</span><button onClick={() => navigate({ page: 'work', category: category.id })}>{category.short}</button></>}
      {project && <><span>/</span><span>Project profile</span></>}
    </nav>
    {project ? <div className="work-profile-layout">
      <div className="work-profile-art"><img src={artwork(category!.art)} alt="Illustrative artwork for this collection" /><span className="work-card-seal"><BookOpen size={18} /> {category!.short}</span><span className="work-profile-art-caption">{project.status}</span></div>
      <article className="work-profile-copy" data-guardian-copy>
        <p className="work-kicker">{category!.title} <span> / {category!.id === 'experience' ? 'ROLE PROFILE' : 'PROJECT PROFILE'}</span></p>
        <h1 tabIndex={-1} data-view-heading>{project.title}</h1>
        <p className="work-lede">{project.line}</p>
        <div className="work-facts"><span>{project.status}</span>{project.period && <span>{project.period}</span>}</div>
        <div className="work-story"><h2>The question</h2><p>{project.story}</p><h2>The approach</h2><p>{project.approach}</p><h2>What came from it</h2><p>{project.outcome}</p></div>
        <ul className="work-tags" aria-label="Technologies">{project.tech.map(tag => <li key={tag}>{tag}</li>)}</ul>
        <div className="work-profile-actions">{project.source && <a href={project.source} target="_blank" rel="noreferrer">View repository <ArrowUpRight size={17} /></a>}<button onClick={() => navigate({ page: 'work', category: category!.id })}><ArrowLeft size={16} /> Back to the collection</button></div>
      </article>
    </div> : <>
      <div className="work-introduction" data-guardian-copy>
        <p className="work-kicker"><Compass size={14} /> 02 / THE WORK ARCHIVE</p>
        <h1 tabIndex={-1} data-view-heading aria-label={category ? undefined : 'Ideas, given form.'}>{category ? category.title : <>Ideas, given<br /><em>form.</em></>}</h1>
        <p className="work-description">{category ? category.description : 'A collection of questions I followed — into teams, experiments and systems that do something useful.'}</p>
        <div className="work-selection" aria-live="polite"><span className="work-selection-number">{String((category ? projectIndex : categoryIndex) + 1).padStart(2, '0')}</span><div><h2>{activeTitle}</h2><p>{category ? selectedProject.line : selectedCategory.description}</p><span className="work-selection-meta">{category ? selectedProject.status : `${selectedCategory.projects.length} selected entries`}</span></div></div>
        <button className="work-open" onClick={open}>{category ? category.id === 'experience' ? 'Read the role' : 'Read the project' : 'Open collection'}<ArrowRight size={18} /></button>
      </div>
      <DiscCascadeCarousel key={category?.id ?? 'categories'} items={items} className={`work-cascade ${category ? 'work-cascade-cards' : 'work-cascade-medallions'}`} height="100svh" discSize={category ? 'clamp(230px, 26vw, 350px)' : 'clamp(250px, 29vw, 390px)'} shape={category ? 'card' : 'disc'} motionEnabled={moving} spacing={category ? 1.05 : 1.08} rise={.34} depth={.18} yaw={-12} fan={-8} tilt={category ? -3 : -5} roll={0} spin={0} sheen={.16} loop={false} index={category ? projectIndex : categoryIndex} defaultIndex={category ? projectIndex : categoryIndex} onIndexChange={category ? setProjectIndex : setCategoryIndex} onSelect={(_, index) => navigate(category ? { page: 'work', category: category.id, project: category.projects[index].id } : { page: 'work', category: workCategories[index].id })} brand="" indexLabel="" details={false} reviews={false} frame={false} hint="" background="transparent" color="#f4e8ce" ariaLabel={category ? `${category.title} projects` : 'Work categories'} />
      <div className="work-quick-index" aria-label={category ? 'Choose a project' : 'Choose a collection'}>{(category ? category.projects : workCategories).map((item, index) => <button key={item.id} aria-pressed={(category ? projectIndex : categoryIndex) === index} onClick={() => category ? setProjectIndex(index) : setCategoryIndex(index)}><span>{String(index + 1).padStart(2, '0')}</span>{'short' in item ? item.short : item.title}</button>)}</div>
    </>}
    <footer className="work-footer"><span><Layers size={13} />{project ? category!.id === 'experience' ? 'THE WORK BEHIND THE ROLE' : 'THE IDEA BEHIND THE BUILD' : category ? `${category.projects.length} ${category.id === 'experience' ? 'ROLES' : 'PROJECTS'} · ONE IDEA AT A TIME` : '6 COLLECTIONS · 15 SELECTED ENTRIES'}</span><button onClick={() => navigate({ page: 'journey' })}>Follow my journey <ArrowRight size={16} /></button></footer>
  </section>;
}


