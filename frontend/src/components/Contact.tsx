import { FormEvent, useState } from "react";
import { sendContact } from "../lib/api";
import type { ResumeBundle } from "../lib/api";

export default function Contact({ links }: { links: ResumeBundle["profile"]["links"] }) {
  const [status, setStatus] = useState<string>("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("Sending...");
    try {
      await sendContact({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        message: String(data.get("message") || ""),
      });
      event.currentTarget.reset();
      setStatus("Message received.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send message.");
    }
  }

  return (
    <section id="contact" className="section contact">
      <div className="section-heading">
        <p className="eyebrow">Contact</p>
        <h2>Let us build something precise</h2>
      </div>
      <div className="contact-grid">
        <div className="contact-card magnetic-card">
          <strong>Email</strong>
          <a href={links.email}>{links.email.replace("mailto:", "")}</a>
          {links.linkedin && <a href={links.linkedin}>LinkedIn</a>}
          {links.github && <a href={links.github}>GitHub</a>}
        </div>
        <form className="contact-form magnetic-card" onSubmit={submit}>
          <label>
            Name
            <input name="name" required minLength={1} maxLength={160} />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Message
            <textarea name="message" required minLength={5} rows={5} />
          </label>
          <button className="button primary" type="submit">Send</button>
          {status && <p className="form-status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

