# ── STAGE 1: builder ──────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY admin/package.json admin/
RUN npm ci --include-workspace-root -w admin

COPY admin/tsconfig*.json admin/vite.config.ts admin/index.html admin/
COPY admin/src admin/src
RUN npm run build -w admin

# ── STAGE 2: runtime ──────────────────────────────────────
FROM nginx:alpine AS runtime
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]