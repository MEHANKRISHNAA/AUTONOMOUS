// Default runtime config for local development (npm run dev / vite preview).
// Overwritten at container start by docker-entrypoint.sh, which prepends
// window.__API_BASE__ from the API_BASE_URL environment variable before this
// file is served. Left EMPTY here on purpose: an empty __API_BASE__ falls
// through to the relative "/api" default in src/lib/api.ts, which vite's
// dev-server proxy (vite.config.ts) and the nginx container's proxy
// (nginx.conf) both already terminate correctly - no origin needs guessing.
window.__API_BASE__ = window.__API_BASE__ || "";
