export interface ArchitectureStage {
  label: string;
  detail: string;
  branches: string[];
}

export interface ProjectDetails {
  problem: string;
  approach: string[];
  tech: { group: string; items: string[] }[];
  architecture: ArchitectureStage[];
  outcomes: string[];
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  role: string;
  details?: ProjectDetails | null;
}

export interface ResumeBundle {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    years_experience: number;
    summary: string;
    links: { email: string; github: string; linkedin: string };
  };
  skills: { group: string; items: string[] }[];
  experience: {
    title: string;
    company: string;
    location: string;
    start: string;
    end: string;
    current: boolean;
    bullets: string[];
  }[];
  projects: Project[];
  other_projects: { name: string; category: string; description: string }[];
  education: { degree: string; institution: string; start: string; end: string; highlights: string[] }[];
  languages_spoken: { name: string; level: string }[];
}

/**
 * Where the frontend finds the backend. Resolution order, most specific first:
 *   1. `?api=` in the query string - point at a different backend with no rebuild.
 *   2. `window.__API_BASE__` - set by public/env.js, overwritten at container
 *      start by docker-entrypoint.sh from API_BASE_URL.
 *   3. `/api` - a RELATIVE path, safe as a default because both places this
 *      frontend runs already terminate it: vite's dev-server proxy
 *      (vite.config.ts) and nginx's proxy (nginx.conf) in the container.
 */
function resolveApiBase(): string {
  const fromQuery = new URLSearchParams(window.location.search).get("api");
  const injected = (window as any).__API_BASE__?.trim() || null;
  return (fromQuery || injected || "/api").replace(/\/$/, "");
}

const API_BASE = resolveApiBase();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export function getResume(): Promise<ResumeBundle> {
  return request<ResumeBundle>("/resume");
}

export function sendContact(payload: { name: string; email: string; message: string }) {
  return request<{ id: number; received: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

