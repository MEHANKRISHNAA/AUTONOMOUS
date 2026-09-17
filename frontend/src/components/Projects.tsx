import { useState } from "react";
import type { Project } from "../lib/api";

export default function Projects({
  projects,
  otherProjects,
}: {
  projects: Project[];
  otherProjects: { name: string; category: string; description: string }[];
}) {
  const [active, setActive] = useState<Project | null>(projects[0] ?? null);

  return (
    <section id="projects" className="section projects">
      <div className="section-heading">
        <p className="eyebrow">Selected Systems</p>
        <h2>AI products with architecture behind the shine</h2>
      </div>
      <div className="project-layout">
        <div className="project-list">
          {projects.map((project) => (
            <button
              className={`project-card magnetic-card ${active?.id === project.id ? "active" : ""}`}
              key={project.id}
              onClick={() => setActive(project)}
            >
              <span>{project.tagline}</span>
              <strong>{project.name}</strong>
              <p>{project.description}</p>
              <div className="tag-cloud">
                {project.tags.map((tag) => <em key={tag}>{tag}</em>)}
              </div>
            </button>
          ))}
        </div>
        {active && (
          <article className="project-detail magnetic-card">
            <p className="eyebrow">{active.role}</p>
            <h3>{active.name}</h3>
            <p>{active.details?.problem ?? active.description}</p>
            <div className="architecture">
              {active.details?.architecture.map((stage, index) => (
                <div className="arch-step" key={stage.label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{stage.label}</strong>
                    <p>{stage.detail}</p>
                    {!!stage.branches.length && (
                      <div className="mini-tags">
                        {stage.branches.map((branch) => <i key={branch}>{branch}</i>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>
      <div className="other-grid">
        {otherProjects.map((project) => (
          <article className="other-project" key={project.name}>
            <span>{project.category}</span>
            <strong>{project.name}</strong>
            <p>{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

