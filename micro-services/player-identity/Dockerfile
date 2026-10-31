# -- STAGE 1: builder --
FROM node:26-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Use npm install, not npm ci: ci fails on node:24-alpine (known npm bug)
RUN npm install
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# -- STAGE 2: production dependencies --
FROM node:26-alpine AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev && mkdir -p node_modules

# -- STAGE 3: runtime --
FROM node:26-alpine AS runtime
# npm is only a build tool and bundles its own undici, which keeps showing up in scans
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY package.json ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]