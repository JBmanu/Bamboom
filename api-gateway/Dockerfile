# ── STAGE 1: builder ──────────────────────────────────────
# Compila TypeScript → JavaScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copia prima i file delle dipendenze per sfruttare
# il layer caching di Docker
COPY package.json package-lock.json ./

RUN npm install

# Copia config e sorgenti, poi compila
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ── STAGE 2: runtime ──────────────────────────────────────
# Immagine finale: solo Node + dipendenze produzione + dist/
FROM node:22-alpine AS runtime

# Utente non-root per sicurezza
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json package-lock.json ./

# Solo dipendenze di produzione (niente typescript, jest, ecc.)
RUN npm install --omit=dev

# Copia il JavaScript compilato dallo stage builder
COPY --from=builder /app/dist ./dist

USER appuser

# Porta su cui il gateway ascolta
EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]