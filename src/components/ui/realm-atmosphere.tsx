/** Shared, non-interactive atmosphere behind the copy and the roaming guardian. */
export function RealmAtmosphere({ page }: { page: 'home' | 'work' | 'journey' | 'contact' }) {
  return <div className={`realm-atmosphere realm-atmosphere-${page}`} aria-hidden="true">
    <div className="realm-cloud-light" />
    <div className="realm-abyss-light" />
    <div className="realm-cloud-drift" />
    {Array.from({ length: 18 }, (_, i) => {
      const celestial = i % 3 === 0;
      return <span key={i} className={`realm-ember ${celestial ? 'realm-ember-gold' : 'realm-ember-dark'}`} style={{
        left: `${celestial ? 10 + (i * 11) % 47 : 57 + (i * 7) % 39}%`,
        top: `${24 + (i * 17) % 68}%`, animationDelay: `${-i * 2.3}s`, animationDuration: `${15 + i % 7 * 2}s`,
      }} />;
    })}
  </div>;
}
