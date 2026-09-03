# AIOPS App Model — Frontend (TanStack Start SSR + Nitro node-server)
#
# Minimal production image for Loft EKS (linux/arm64).
# Use Debian slim (glibc), not Alpine: sharp/esbuild often break on musl/arm64.
#
# Build (local):
#   docker build -t aiops-app-model-front:local \
#     --build-arg VITE_API_URL=http://localhost:8000 .
#
# Production: GHA loads deploy/published-hosts.env and bakes:
#   VITE_API_URL (SSR fallback), VITE_CORP_*, VITE_CROSS_* (browser origin map).
# Do not hardcode corp hosts here.
#
# Run:
#   docker run --rm -p 8080:8080 aiops-app-model-front:local

FROM node:24-bookworm-slim AS build

WORKDIR /app

ENV npm_config_audit=false \
    npm_config_fund=false \
    npm_config_update_notifier=false \
    NITRO_PRESET=node-server

COPY package.json package-lock.json ./
RUN node -v && npm -v \
    && npm ci --no-audit --no-fund

COPY vite.config.ts tsconfig.json components.json ./
COPY public ./public
COPY src ./src
COPY docker ./docker

# Defaults for local; prod workflow overrides from deploy/published-hosts.env
ARG VITE_API_URL=http://localhost:8000
ARG VITE_CORP_API_URL=
ARG VITE_CROSS_API_URL=
ARG VITE_CORP_FRONT_URL=
ARG VITE_CROSS_FRONT_URL=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_CORP_API_URL=${VITE_CORP_API_URL} \
    VITE_CROSS_API_URL=${VITE_CROSS_API_URL} \
    VITE_CORP_FRONT_URL=${VITE_CORP_FRONT_URL} \
    VITE_CROSS_FRONT_URL=${VITE_CROSS_FRONT_URL}

RUN npm run build

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    NITRO_PRESET=node-server

WORKDIR /app

COPY package.json package-lock.json ./
RUN DD_TRACE_VER="$(node -p "require('./package-lock.json').packages['node_modules/dd-trace'].version")" \
    && npm install --omit=dev --no-audit --no-fund --ignore-scripts "dd-trace@${DD_TRACE_VER}" \
    && rm -f package.json package-lock.json \
    && rm -rf /root/.npm

RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY --from=build /app/.output ./.output
COPY --from=build /app/docker ./docker

RUN chmod +x /app/docker/entrypoint.sh \
    && chown -R app:app /app

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8080/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker/entrypoint.sh"]
