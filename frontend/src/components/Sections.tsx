import type { ResumeBundle } from "../lib/api";

export function Skills({ groups }: { groups: ResumeBundle["skills"] }) {
  return (
    <section id="skills" className="section">
      <div className="section-heading">
        <p className="eyebrow">Capability Map</p>
        <h2>Practical AI engineering stack</h2>
      </div>
      <div className="skill-grid">
        {groups.map((group) => (
          <article className="magnetic-card skill-card" key={group.group}>
            <h3>{group.group}</h3>
            <div className="tag-cloud">
              {group.items.map((item) => <span key={item}>{item}</span>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Experience({ roles }: { roles: ResumeBundle["experience"] }) {
  return (
    <section id="experience" className="section">
      <div className="section-heading">
        <p className="eyebrow">Timeline</p>
        <h2>Built from data work into production AI systems</h2>
      </div>
      <div className="timeline">
        {roles.map((role) => (
          <article className="timeline-row" key={`${role.company}-${role.start}`}>
            <div className="timeline-date">{role.start} - {role.end}</div>
            <div className="timeline-body magnetic-card">
              <div className="role-title">
                <h3>{role.title}</h3>
                {role.current && <span>Current</span>}
              </div>
              <p>{role.company} / {role.location}</p>
              <ul>
                {role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Education({ entries }: { entries: ResumeBundle["education"] }) {
  return (
    <section className="section compact">
      <div className="section-heading">
        <p className="eyebrow">Education</p>
        <h2>Engineering foundation</h2>
      </div>
      {entries.map((entry) => (
        <article className="education magnetic-card" key={entry.degree}>
          <h3>{entry.degree}</h3>
          <p>{entry.institution} / {entry.start} - {entry.end}</p>
        </article>
      ))}
    </section>
  );
}

