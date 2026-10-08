# ── STAGE 1: builder ──────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY player/package.json player/
RUN npm ci --include-workspace-root -w player

COPY player/tsconfig*.json player/vite.config.ts player/index.html player/
COPY player/src player/src
RUN npm run build -w player

# ── STAGE 2: runtime ──────────────────────────────────────
FROM nginx:alpine AS runtime
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
COPY player/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/player/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]