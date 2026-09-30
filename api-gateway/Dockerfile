# ── STAGE 1: builder ──────────────────────────────────────
# Compila TypeScript → JavaScript
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── STAGE 2: runtime ──────────────────────────────────────
FROM node:22-alpine AS runtime

# Aggiorna npm (fix CVE) e crea l'utente non-root in un solo layer
RUN npm install -g npm@latest && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

USER appuser
EXPOSE 8000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]