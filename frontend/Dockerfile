# frontend/Dockerfile  (build: docker build --build-arg APP=player -f Dockerfile frontend)
FROM node:24-alpine AS builder
ARG APP
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY ${APP}/package.json ${APP}/
RUN npm ci --include-workspace-root -w ${APP}
COPY ${APP}/tsconfig*.json ${APP}/vite.config.ts ${APP}/index.html ${APP}/
COPY ${APP}/src ${APP}/src
RUN npm run build -w ${APP}

FROM nginx:alpine AS runtime
ARG APP
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/${APP}/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]