# ── STAGE 1: builder ──────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Usiamo npm install invece di npm ci
# per evitare il bug con node:24-alpine
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ── STAGE 2: runtime ──────────────────────────────────────
FROM node:24-alpine AS runtime

RUN npm install -g npm@latest && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]