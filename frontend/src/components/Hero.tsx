import type { ResumeBundle } from "../lib/api";
import SensorCore from "../three/SensorCore";

export default function Hero({ profile }: { profile: ResumeBundle["profile"] }) {
  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{profile.title}</p>
        <h1>{profile.name}</h1>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-stats">
          <span>{profile.location}</span>
          <span>{profile.years_experience} years experience</span>
          <span>LangGraph and RAG systems</span>
        </div>
        <div className="hero-actions">
          <a className="button primary" href="#projects">View Work</a>
          <a className="button secondary" href="#contact">Contact</a>
        </div>
      </div>
      <div className="hero-visual">
        <SensorCore />
        <div className="sensor-panel">
          <span className="sensor-dot" />
          <span>AI workflow signal</span>
          <strong>stable</strong>
        </div>
      </div>
    </section>
  );
}

