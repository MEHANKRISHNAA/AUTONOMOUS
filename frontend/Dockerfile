# Two stages: build the static bundle with node, then serve it from nginx.
# Same "build once, configure at run time" API_BASE story as
# portfolio_website/frontend/Dockerfile.

FROM node:20-alpine AS builder

WORKDIR /build
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /build/dist /usr/share/nginx/html

COPY docker-entrypoint.sh /docker-entrypoint.d/40-api-base.sh
RUN chmod +x /docker-entrypoint.d/40-api-base.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1
