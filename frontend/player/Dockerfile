# ── STAGE 1: builder ──────────────────────────────────────
# Compila l'app Vue con Node → produce file statici in dist/
FROM node:22-alpine AS builder

WORKDIR /app

# Copia i file delle dipendenze per il layer caching
COPY package.json package-lock.json ./

RUN npm install

# Copia config e sorgenti
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src/ ./src/

# Builda: vue-tsc controlla i tipi + vite produce dist/
RUN npm run build

# ── STAGE 2: runtime ──────────────────────────────────────
# Nginx serve i file statici prodotti dallo stage builder.
# Immagine finale minuscola (~25MB): solo Nginx + i file dist/,
# niente Node, niente node_modules.
FROM nginx:alpine AS runtime

RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copia la nostra configurazione Nginx personalizzata
# (gestisce il routing SPA — spiegato sotto)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file statici compilati dallo stage builder
# nella cartella che Nginx serve di default
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx ascolta sulla porta 80 (standard HTTP)
EXPOSE 80

# Avvia Nginx in foreground (necessario nei container:
# il processo principale non deve andare in background)
CMD ["nginx", "-g", "daemon off;"]