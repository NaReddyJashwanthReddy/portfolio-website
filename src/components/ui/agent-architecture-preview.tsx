import { useState } from 'react';
import { skyRoles } from '../../data/skygarden';

export function AgentArchitecturePreview() {
  const [selected, setSelected] = useState(0);
  const [role, responsibility] = skyRoles[selected];

  return <details className="agent-architecture-preview">
    <summary>Explore the eight-role architecture</summary>
    <div className="agent-architecture-body">
      <p className="agent-architecture-note">Interactive architecture preview · The agent workspace is in development.</p>
      <p>Select a specialist to inspect its planned responsibility.</p>
      <div className="agent-role-grid" role="group" aria-label="Agent specialists">
        {skyRoles.map(([name], index) => <button key={name} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{name}</button>)}
      </div>
      <div className="agent-role-inspector" aria-live="polite" aria-atomic="true">
        <h3>{role}</h3>
        <p>{responsibility}</p>
      </div>
    </div>
  </details>;
}
