export default function Nav({ name }: { name: string }) {
  return (
    <nav className="nav">
      <a className="brand" href="#top">{name.split(" ")[0]}</a>
      <div className="nav-links">
        <a href="#skills">Skills</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
}

