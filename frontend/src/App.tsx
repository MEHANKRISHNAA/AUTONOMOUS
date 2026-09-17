import { useEffect, useState } from "react";
import GlowField from "./components/GlowField";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import { Education, Experience, Skills } from "./components/Sections";
import { getResume, type ResumeBundle } from "./lib/api";

export default function App() {
  const [resume, setResume] = useState<ResumeBundle | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getResume().then(setResume).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main className="state-screen">
        <h1>Backend unavailable</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="state-screen">
        <div className="loading-orb" />
      </main>
    );
  }

  return (
    <>
      <GlowField />
      <Nav name={resume.profile.name} />
      <main>
        <Hero profile={resume.profile} />
        <Skills groups={resume.skills} />
        <Experience roles={resume.experience} />
        <Projects projects={resume.projects} otherProjects={resume.other_projects} />
        <Education entries={resume.education} />
        <Contact links={resume.profile.links} />
      </main>
      <footer>{resume.profile.name} / AI Engineer</footer>
    </>
  );
}

